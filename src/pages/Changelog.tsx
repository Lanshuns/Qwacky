import { useState, useEffect } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { BackButton } from '../styles/SharedStyles';
import { ChangelogContainer, ChangelogContent, ChangelogLoadingMessage, ChangelogErrorMessage } from '../styles/pages.styles';

interface ChangelogProps {
  onBack: () => void;
}

const parseChangelog = (markdown: string) => {
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>');

  const listItems = html.match(/^- (.*$)/gm);
  if (listItems) {
    listItems.forEach(item => {
      const listContent = item.replace(/^- /, '');
      html = html.replace(item, `<li>${listContent}</li>`);
    });
  }

  html = html.replace(/<li>(.+?)<\/li>(\s*<li>)/g, '<li>$1</li>$2');
  html = html.replace(/(^|[^>])\s*<li>/gm, '$1<ul><li>');
  html = html.replace(/<\/li>\s*($|[^<])/gm, '</li></ul>$1');

  html = html.replace(/<\/ul>\s*<ul>/g, '');

  html = html.replace(/<\/h2>/g, '</h2><div class="version-content">');
  html = html.replace(/(<h2>|$)/g, '</div>$1');

  html = html.replace(/<div class="version-content"><\/div>/g, '');
  html = html.replace(/^<\/div>/, '');

  html = html.replace('<h1>Changelog</h1>', '<h1>What\'s new?</h1>');

  return html;
};

export const Changelog = ({ onBack }: ChangelogProps) => {
  const [changelog, setChangelog] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        const response = await fetch(chrome.runtime.getURL('CHANGELOG.md'));
        if (!response.ok) {
          throw new Error('Failed to load changelog');
        }
        const text = await response.text();
        const parsedHtml = parseChangelog(text);
        setChangelog(parsedHtml);
      } catch (err) {
        console.error('Error loading changelog:', err);
        setError('Could not load changelog. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChangelog();
  }, []);

  return (
    <ChangelogContainer>
      <BackButton onClick={onBack}>
        <MdArrowBack size={20} />
        Back to Dashboard
      </BackButton>

      {loading && <ChangelogLoadingMessage>Loading changelog...</ChangelogLoadingMessage>}
      {error && <ChangelogErrorMessage>{error}</ChangelogErrorMessage>}

      {!loading && !error && (
        <ChangelogContent dangerouslySetInnerHTML={{ __html: changelog }} />
      )}
    </ChangelogContainer>
  );
};
