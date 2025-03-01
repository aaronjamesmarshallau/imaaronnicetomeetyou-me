import { FunctionComponent, useEffect, useState } from "react"
import styled from "styled-components";
import { Blog } from "../../models/Blog";
import { headingsPlugin, quotePlugin, listsPlugin, thematicBreakPlugin, codeBlockPlugin, codeMirrorPlugin, directivesPlugin, AdmonitionDirectiveDescriptor, MDXEditor } from "@mdxeditor/editor";
import { EditorState } from "@codemirror/state"
import { EditorView } from "codemirror";

import '@mdxeditor/editor/style.css'
import { Page } from "../Page";

interface BlogsPageProps {
}

const plugins = [
  headingsPlugin(),
  quotePlugin(),
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

const getBlogs = (): Promise<Blog[]> => {
  return fetch("/api/blogs", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((responseJson) => responseJson as unknown as any[])
    .then((responseJson) => responseJson.map((value) => ({
      ...value,
      createdAt: new Date(value.createdAt),
    }))
    )
};

export const BlogsPage: FunctionComponent<BlogsPageProps> = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  useEffect(() => {
    getBlogs()
      .then((data) => setBlogs(data));
  }, []);

  return (
    <Page>
      {blogs.map((blog) => (
        <article key={blog.blogId}>
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
      ))}
    </Page>
  )
}