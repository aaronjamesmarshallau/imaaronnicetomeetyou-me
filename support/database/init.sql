create table posts(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text not null,
    content text not null,
    author text not null,
    created_at timestamptz DEFAULT now(),
    modified_at timestamptz DEFAULT now()
);