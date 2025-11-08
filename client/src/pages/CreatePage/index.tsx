import { ChangeEvent, ChangeEventHandler, FunctionComponent, useEffect, useState } from "react";
import styled from "styled-components";
import { AdmonitionDirectiveDescriptor, BlockTypeSelect, BoldItalicUnderlineToggles, codeBlockPlugin, codeMirrorPlugin, CodeToggle, CreateLink, diffSourcePlugin, DiffSourceToggleWrapper, directivesPlugin, InsertAdmonition, listsPlugin, markdownShortcutPlugin, MDXEditor, quotePlugin, thematicBreakPlugin, toolbarPlugin, linkPlugin } from '@mdxeditor/editor'
import { headingsPlugin } from '@mdxeditor/editor'

import '@mdxeditor/editor/style.css'
import { Page } from "../Page";
import { Button } from "../../components/forms/inputs/Button";
import { authFetch, isLoggedIn } from "../../auth";
import { useNavigate } from "react-router-dom";

export const API_URL = import.meta.env.VITE_API_URL || "";

const TitleInput = styled("input")`
  width: 100%;
  height: 40px;
  margin-bottom: 10px;
  border: none;
  border-radius: 10px;
  outline: none;
  transition: box-shadow ease 0.2s;
  box-sizing: border-box;
  padding: 5px 10px;
  font-size: 1.1em;

  &:active, &:focus {
      outline: none;
      box-shadow: 5px 5px 0 0 ${({ theme }) => theme.highlight.primary};
  }
`;

const ContentEditor = styled(MDXEditor)`
  width: 100%;
  background-color: #fff;
  border: none;
  border-radius: 10px;
  transition: box-shadow ease 0.2s;
  overflow: hidden;
  box-sizing: border-box;
  margin-bottom: 10px;

  &:has(*:active), &:focus-within {
      outline: none;
      box-shadow: 5px 5px 0 0 ${({ theme }) => theme.highlight.primary};
  }

  & .mdx-editor-toolbar {
    box-sizing: border-box;
  }
`;



const plugins = [
  headingsPlugin(),
  quotePlugin(),
  listsPlugin(),
  linkPlugin(),
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
      makefile: 'Makefile',
      nix: 'Nix'
    }
  }),
  directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
  diffSourcePlugin({ diffMarkdown: 'An older version', viewMode: 'rich-text' }),
  markdownShortcutPlugin(),
  toolbarPlugin({
    toolbarClassName: 'mdx-editor-toolbar',
    toolbarContents: () => (
      <DiffSourceToggleWrapper>
        <BoldItalicUnderlineToggles />
        <BlockTypeSelect />
        <CodeToggle />
        <CreateLink />
        <InsertAdmonition />
      </DiffSourceToggleWrapper>
    )
  })
]

const publishBlog = (title: string, content: string) => (_evt: React.MouseEvent<HTMLButtonElement>): Promise<Response> => {
  return authFetch(`${API_URL}/api/blogs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ title, content }),
  });
};

const LS_BLOG_TITLE_KEY = "draft-blog-title";
const LS_BLOG_CONTENT_KEY = "draft-blog-content";

export const CreatePage: FunctionComponent = () => {
  const [title, setTitle] = useState<string>(window.localStorage.getItem(LS_BLOG_TITLE_KEY) || "");
  const [content, setContent] = useState<string>(window.localStorage.getItem(LS_BLOG_CONTENT_KEY) || "");
  const navigate = useNavigate();

  useEffect(() => {
    isLoggedIn()
      .then(loggedIn => {
        if (!loggedIn) {
          navigate("/login");
        }
      })
  }, []);

  const updateTitle: ChangeEventHandler<HTMLInputElement> = (evt: ChangeEvent<HTMLInputElement>) => {
    const newTitle = evt.target.value;
    window.localStorage.setItem(LS_BLOG_TITLE_KEY, newTitle);
    setTitle(newTitle);
  };

  const updateContent = (markdown: string) => {
    window.localStorage.setItem(LS_BLOG_CONTENT_KEY, markdown);
    setContent(markdown);
  };

  return (
    <Page>
      <h1>Create Blog</h1>
      <form>
        <TitleInput value={title} onChange={updateTitle} />
        <ContentEditor
          markdown={content}
          onChange={updateContent}
          plugins={plugins}
        />
        <Button
          type="button"
          onClick={publishBlog(title, content)}
        >
          Publish
        </Button>
      </form>
    </Page>
  );
}