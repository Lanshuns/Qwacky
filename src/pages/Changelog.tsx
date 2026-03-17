import { useState, useEffect } from 'react';
import { MdArrowBack } from 'react-icons/md';
import Markdown from 'react-markdown';
import { BackButton } from '../styles/SharedStyles';
import { ChangelogContainer, ChangelogContent, ChangelogLoadingMessage, ChangelogErrorMessage } from '../styles/pages.styles';

interface ChangelogProps {
  onBack: () => void;
}

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
        setChangelog(text.replace(/^# Changelog$/m, "# What's new?"));
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
        <ChangelogContent>
          <Markdown>{changelog}</Markdown>
        </ChangelogContent>
      )}
    </ChangelogContainer>
  );
};
