use std::process::exit;

use axum::{
    extract::{Request, State},
    http::{header::CONTENT_TYPE, HeaderValue},
    middleware::{self, Next},
    response::{Html, Response},
    routing::{get, post},
    Form, Router,
};
use handlebars::{Handlebars, TemplateError};
use itertools::{Either, Itertools};
use serde::{Deserialize, Serialize};
use sqlx::{
    postgres::PgPoolOptions,
    types::{
        chrono::{DateTime, Utc},
        Uuid,
    },
    FromRow, Pool, Postgres, Row,
};
use tower::ServiceBuilder;
use tower_http::services::ServeDir;

#[derive(Clone)]
pub struct RouteDependencies {
    pub templates: Handlebars<'static>,
    pub database: Pool<Postgres>,
}

fn dev_mode() -> bool {
    return cfg!(debug_assertions);
}

#[tokio::main]
async fn main() {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect("postgres://imaaronnicetomeetyou_me:example123@localhost/imaaronnicetomeetyou_me")
        .await
        .unwrap();

    let mut hbs = Handlebars::new();
    hbs.set_dev_mode(dev_mode());

    let template_reg_results = vec![
        // Pages
        hbs.register_template_file("admin", "src/htmx/admin.hbs"),
        hbs.register_template_file("blog", "src/htmx/blog.hbs"),
        hbs.register_template_file("index", "src/htmx/index.hbs"),
        // Partials
        hbs.register_template_file("header", "src/htmx/partials/header.hbs"),
        hbs.register_template_file(
            "blogPreview",
            "src/htmx/partials/blog-preview.hbs",
        ),
        hbs.register_template_file(
            "commonHead",
            "src/htmx/partials/common-head.hbs",
        ),
    ];

    let (_, errs): (Vec<()>, Vec<TemplateError>) = template_reg_results
        .into_iter()
        .partition_map(|val| match val {
            Ok(unit) => Either::Left(unit),
            Err(error) => Either::Right(error),
        });

    if errs.len() > 0 {
        println!("Errors occurred loading templates:");

        for err in errs {
            println!("  {}", err)
        }

        exit(1);
    }

    let state = RouteDependencies {
        templates: hbs,
        database: pool,
    };
    let app = Router::new()
        .nest_service(
            "/assets",
            ServiceBuilder::new()
                .layer(middleware::from_fn(set_correct_content_header))
                .service(ServeDir::new("src/htmx/assets")),
        )
        .route("/", get(index_handler))
        .route("/blog", get(blog_handler))
        .route("/blog", post(create_blog_post_handler))
        .route("/admin", get(admin_handler))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    println!("Listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn index_handler(
    State(RouteDependencies { templates, .. }): State<RouteDependencies>,
) -> Html<String> {
    let index_content = templates.render("index", &String::new()).unwrap();
    let html = Html(index_content);
    html
}

#[derive(FromRow)]
struct SlimBlogPost {
    pub id: Uuid,
    pub title: String,
    pub trimmed_content: String,
    pub author: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize)]
struct SerializableBlogPost {
    id: String,
    title: String,
    content: String,
    author: String,
    created_at: String,
}

#[derive(Serialize)]
struct BlogPageData {
    posts: Vec<SerializableBlogPost>,
}

async fn blog_handler(
    State(RouteDependencies {
        templates,
        database,
    }): State<RouteDependencies>,
) -> Html<String> {
    let result = sqlx::query(
        "SELECT id, title, LEFT(content, 300) as trimmed_content, author, created_at 
        FROM posts
        ORDER BY created_at
        LIMIT 10;",
    )
    .fetch_all(&database)
    .await;

    let rows = match result {
        Err(err) => {
            println!("Error while querying data: {}", err);
            Vec::new()
        }
        Ok(r) => r,
    };

    let (errs, blog_posts): (Vec<sqlx::Error>, Vec<SerializableBlogPost>) =
        rows.iter().map(SlimBlogPost::from_row).partition_map(
            |err_or_slim_blog| match err_or_slim_blog {
                Err(err) => Either::Left(err),
                Ok(slim_blog) => Either::Right(SerializableBlogPost {
                    id: slim_blog.id.to_string(),
                    title: slim_blog.title,
                    content: slim_blog.trimmed_content,
                    author: slim_blog.author,
                    created_at: slim_blog.created_at.to_rfc3339(),
                }),
            },
        );

    if errs.len() > 0 {
        println!("Errors decoding blog posts from sql:");

        for err in errs {
            println!("  {}", err);
        }
    }

    let blog_content = templates
        .render("blog", &BlogPageData { posts: blog_posts })
        .unwrap();
    let html = Html(blog_content);
    html
}

async fn admin_handler(
    State(RouteDependencies { templates, .. }): State<RouteDependencies>,
) -> Html<String> {
    let admin_content = templates.render("admin", &String::new()).unwrap();
    let html = Html(admin_content);
    html
}

#[derive(Deserialize)]
struct BlogPost {
    title: String,
    content: String,
}

#[axum::debug_handler]
async fn create_blog_post_handler(
    State(RouteDependencies { database, .. }): State<RouteDependencies>,
    Form(blog_post): Form<BlogPost>,
) -> Html<String> {
    let result = sqlx::query(
        "INSERT INTO posts (title, content, author) 
        VALUES ($1, $2, $3)
        RETURNING id;",
    )
    .bind(blog_post.title)
    .bind(blog_post.content)
    .bind("Aaron")
    .fetch_one(&database)
    .await;

    match result {
        Err(err) => {
            println!("Error connecting to database: {}", err);
            Html("<div>Error occurred while saving data...</div>".to_string())
        }
        Ok(row) => {
            let id: Uuid = row.get(0);
            println!("Successfully saved post with id: {}", id);
            Html(
                format!("<div>Blog post successfully created! {}</div>", id)
                    .to_string(),
            )
        }
    }
}

async fn set_correct_content_header(request: Request, next: Next) -> Response {
    let mut response = next.run(request).await;

    match response.headers().get(CONTENT_TYPE) {
        None => response,
        Some(header_value) => match header_value.to_str() {
            Err(to_str_err) => {
                println!("{}", to_str_err);
                response
            }
            Ok("text/css") => {
                let headers = response.headers_mut();
                headers.remove(CONTENT_TYPE);
                headers.insert(
                    CONTENT_TYPE,
                    HeaderValue::from_static("text/css; charset=utf-8"),
                );

                response
            }
            Ok(_) => response,
        },
    }
}
