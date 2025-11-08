import { FunctionComponent, useEffect, useState } from "react"
import styled from "styled-components";
import { Blog } from "../../models/Blog";
import { headingsPlugin, quotePlugin, listsPlugin, thematicBreakPlugin, codeBlockPlugin, codeMirrorPlugin, directivesPlugin, AdmonitionDirectiveDescriptor, MDXEditor, linkPlugin } from "@mdxeditor/editor";
import { EditorState } from "@codemirror/state"
import { EditorView } from "codemirror";

import '@mdxeditor/editor/style.css'
import { Page } from "../Page";
import { useParams } from "react-router-dom";

export const API_URL = import.meta.env.VITE_API_URL || "";

interface BlogsPageProps {
}

const plugins = [
  headingsPlugin(),
  quotePlugin(),
  linkPlugin(),
  listsPlugin(),
  thematicBreakPlugin(),
  codeBlockPlugin(),
  codeMirrorPlugin({
    codeBlockLanguages: {
      js: 'JavaScript',
      css: 'CSS',
      txt: 'text',
      tsx: 'TypeScript',
      ts: 'TypeScript',
      jsx: 'JSX',
      html: 'HTML',
      json: 'JSON',

      bash: 'Bash',
      md: 'Markdown',
      sh: 'Shell',
      yml: 'YAML',
      yaml: 'YAML',

      graphql: 'GraphQL',
      sql: 'SQL',
      python: 'Python',
      ruby: 'Ruby',
      go: 'Go',
      java: 'Java',
      php: 'PHP',
      swift: 'Swift',
      c: 'C',
      cpp: 'C++',
      cs: 'C#',
      csharp: 'C#',
      rust: 'Rust',
      r: 'R',
      d: 'D',
      dart: 'Dart',
      kotlin: 'Kotlin',
      scala: 'Scala',
      perl: 'Perl',
      lua: 'Lua',
      shell: 'Shell',
      powershell: 'PowerShell',
      dockerfile: 'Dockerfile',
      makefile: 'Makefile'
    },
    codeMirrorExtensions: [
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      EditorView.contentAttributes.of({ tabindex: "0" })
    ]
  }),
  directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
];

const StyledEditor = styled(MDXEditor)`
  --baseTextContrast: ${({ theme }) => theme.foreground.primary};

  & .prose {
    padding-left: 0;
    padding-right: 0;
  }
`;

const getBlog = (blogId: string): Promise<Blog> => {
  return fetch(`${API_URL}/api/blogs/${blogId}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((responseJson) => responseJson as unknown as any)
    .then((responseJson) => ({
      ...responseJson,
      createdAt: new Date(responseJson.createdAt),
    }));
};

const Navigation = styled.nav`
  margin-bottom: 16px;
`;

const Breadcrumb = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  font-size: 14px;
`;

const BreadcrumbLink = styled.a`
  color: ${({ theme }) => theme.foreground.secondary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const BlogPage: FunctionComponent<BlogsPageProps> = () => {
  const [blog, setBlog] = useState<Blog | undefined>(undefined);
  const { blogId } = useParams();

  if (!blogId) {
    return (
      <Page>
        Oh no!
      </Page>
    )
  }

  useEffect(() => {
    getBlog(blogId)
      .then((data) => setBlog(data));
  }, []);

  return (
    <Page>
      <Navigation>
        <Breadcrumb>
          <BreadcrumbLink href="/">&lt;</BreadcrumbLink>
          <BreadcrumbLink href="/">{blog?.title || ""}</BreadcrumbLink>
        </Breadcrumb>
      </Navigation>
      {
        blog && <article key={blog.blogId}>
          <h2>{blog.title}</h2>
          <sub>{blog.createdAt.toDateString()}</sub>
          <div>
            <StyledEditor
              markdown={blog.content}
              readOnly
              plugins={plugins}
              contentEditableClassName="prose" />
          </div>
        </article>
      }
    </Page>
  )
}