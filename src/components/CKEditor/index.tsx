import { useState, useEffect } from 'react';
import { CKEditor as BaseEditor } from '@ckeditor/ckeditor5-react';

import {
  ClassicEditor,
  AccessibilityHelp,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  Bold,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlEmbed,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  SelectAll,
  SimpleUploadAdapter,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Table,
  TableCellProperties,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  Undo,
} from 'ckeditor5';
import {
  FileLoader,
  UploadAdapter,
  UploadResponse,
} from '@ckeditor/ckeditor5-upload/src/filerepository';
import { Editor } from '@ckeditor/ckeditor5-core';

import { useAdminUploadImage } from '@/services/helper/upload';
import { Box, FormHelperText } from '@mui/material';
import 'ckeditor5/ckeditor5.css';

interface ICKEditorProps {
  onChange?: (value: string) => void;
  value?: string;
  helperText?: string;
}

interface CustomUploadResponse extends UploadResponse {
  default: string;
}

export default function CKEditor({
  onChange,
  value,
  helperText,
}: ICKEditorProps) {
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  const { mutateAsync } = useAdminUploadImage();

  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  const editorConfig = {
    toolbar: {
      items: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        '|',
        'link',
        'insertImage',
        'insertTable',
        'highlight',
        'blockQuote',
        'codeBlock',
        '|',
        'bulletedList',
        'numberedList',
        'todoList',
        'indent',
        'outdent',
      ],
      shouldNotGroupWhenFull: false,
    },
    plugins: [
      AccessibilityHelp,
      Autoformat,
      AutoImage,
      AutoLink,
      Autosave,
      BalloonToolbar,
      BlockQuote,
      Bold,
      Code,
      CodeBlock,
      Essentials,
      FindAndReplace,
      Heading,
      Highlight,
      HorizontalLine,
      HtmlEmbed,
      ImageBlock,
      ImageCaption,
      ImageInline,
      ImageInsert,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageTextAlternative,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      LinkImage,
      List,
      ListProperties,
      MediaEmbed,
      Paragraph,
      PasteFromOffice,
      SelectAll,
      SimpleUploadAdapter,
      SpecialCharacters,
      SpecialCharactersArrows,
      SpecialCharactersCurrency,
      SpecialCharactersEssentials,
      SpecialCharactersLatin,
      SpecialCharactersMathematical,
      SpecialCharactersText,
      Strikethrough,
      Table,
      TableCellProperties,
      TableProperties,
      TableToolbar,
      TextTransformation,
      TodoList,
      Underline,
      Undo,
    ],
    extraPlugins: [uploadPlugin],
    balloonToolbar: [
      'bold',
      'italic',
      '|',
      'link',
      'insertImage',
      '|',
      'bulletedList',
      'numberedList',
    ],
    heading: {
      options: [
        {
          model: 'paragraph',
          title: 'Paragraph',
          class: 'ck-heading_paragraph',
        },
        {
          model: 'heading1',
          view: 'h1',
          title: 'Heading 1',
          class: 'ck-heading_heading1',
        },
        {
          model: 'heading2',
          view: 'h2',
          title: 'Heading 2',
          class: 'ck-heading_heading2',
        },
        {
          model: 'heading3',
          view: 'h3',
          title: 'Heading 3',
          class: 'ck-heading_heading3',
        },
        {
          model: 'heading4',
          view: 'h4',
          title: 'Heading 4',
          class: 'ck-heading_heading4',
        },
        {
          model: 'heading5',
          view: 'h5',
          title: 'Heading 5',
          class: 'ck-heading_heading5',
        },
        {
          model: 'heading6',
          view: 'h6',
          title: 'Heading 6',
          class: 'ck-heading_heading6',
        },
      ],
    },
    image: {
      toolbar: [
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'imageStyle:inline',
        'imageStyle:wrapText',
        'imageStyle:breakText',
        '|',
        'resizeImage',
      ],
    },
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: 'https://',
      decorators: {
        toggleDownloadable: {
          mode: 'manual',
          label: 'Downloadable',
          attributes: {
            download: 'file',
          },
        },
      },
    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true,
      },
    },
    menuBar: {
      isVisible: true,
    },
    placeholder: 'Type or paste your content here!',
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableProperties',
        'tableCellProperties',
      ],
    },
    contentsCss: ['./style.css'],
  };

  function uploadAdapter(loader: FileLoader): UploadAdapter {
    return {
      upload: () => {
        return new Promise<CustomUploadResponse>((resolve, reject) => {
          loader.file.then(async (file: File | null) => {
            if (file === null) {
              reject(new Error('No file to upload'));
              return;
            }
            const result = await mutateAsync({ image: file });
            if (result) {
              resolve({
                default: result.path,
              });
            } else {
              reject();
            }
          });
        });
      },
    };
  }

  function uploadPlugin(editor: Editor) {
    if (editor.plugins.has('FileRepository')) {
      editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return uploadAdapter(loader);
      };
    }
  }

  return (
    <Box>
      {isLayoutReady && (
        <BaseEditor
          editor={ClassicEditor}
          config={editorConfig}
          onChange={(_: Event, editor: Editor) => {
            const data = editor.getData();
            onChange?.(data);
          }}
          data={value}
        />
      )}
      {helperText && (
        <FormHelperText sx={{ color: 'red', fontSize: 13 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
}
