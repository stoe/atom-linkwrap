'use babel';
const {CompositeDisposable} = require('atom');
const validUrl = require('valid-url');

const addMarker = (editor, marker) => {
  // abort early
  if (!editor.replaceSelectedText) {
    return '';
  }

  return editor.replaceSelectedText(null, text => {
    return (text === '') ? '' : `${marker}$selection${marker}`.replace('$selection', text);
  });
};

class mdwrap {
  constructor() {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'atom-markdown-wrapper:paste': this.paste,
        'atom-markdown-wrapper:image': this.image,
        'atom-markdown-wrapper:bold': this.bold,
        'atom-markdown-wrapper:italic': this.italic,
        'atom-markdown-wrapper:strikethrough': this.strikethrough
      })
    );
  }

  destroy() {
    this.subscriptions.dispose();
  }

  paste(editor, selection, clipboard) {
    // abort early
    if (!editor.insertText || !clipboard) {
      return;
    }

    let insert;

    if (editor && selection && clipboard) {
      insert = '[$selection]($href)'
        .replace('$selection', selection)
        .replace('$href', clipboard);
    }

    if (!validUrl.isWebUri(clipboard) && !clipboard.match(/^#/)) {
      throw new Error('Not a valid URL or #anchor');
    }

    editor.insertText(insert);

    return insert;
  }

  image(editor, selection, clipboard) {
    // abort early
    if (!editor.insertText || !clipboard) {
      return;
    }

    let insert;

    if (editor && clipboard) {
      insert = '![$selection]($href)'
        .replace('$selection', selection || '')
        .replace('$href', clipboard);
    }

    if (!validUrl.isWebUri(clipboard)) {
      throw new Error('Not a valid image URL');
    }

    editor.insertText(insert);

    return insert;
  }

  bold(editor) {
    return addMarker(editor, '**');
  }

  italic(editor) {
    return addMarker(editor, '_');
  }

  strikethrough(editor) {
    return addMarker(editor, '~~');
  }
}

module.exports = mdwrap;
