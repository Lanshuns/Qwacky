import { useState, useEffect } from 'react';
import { MdArrowBack } from 'react-icons/md';
import Markdown from 'react-markdown';
import { useI18n } from '../i18n';
import { BackButton } from '../styles/SharedStyles';
import { ChangelogContainer, ChangelogContent, ChangelogLoadingMessage, ChangelogErrorMessage } from '../styles/pages.styles';

interface ChangelogProps {
  onBack: () => void;
}

export const Changelog = ({ onBack }: ChangelogProps) => {
  const { t } = useI18n();
  const [changelog, setChangelog] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        const response = await fetch(chrome.runtime.getURL('CHANGELOG.md'));
        if (!response.ok) {
          throw new Error(t('changelog.loadFailed'));
        }
        const text = await response.text();
        setChangelog(text.replace(/^# Changelog$/m, `# ${t('changelog.heading')}`));
      } catch (err) {
        console.error('Error loading changelog:', err);
        setError(t('changelog.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchChangelog();
  }, [t]);

  return (
    <ChangelogContainer>
      <BackButton onClick={onBack}>
        <MdArrowBack size={20} />
        {t('common.backToDashboard')}
      </BackButton>

      {loading && <ChangelogLoadingMessage>{t('changelog.loading')}</ChangelogLoadingMessage>}
      {error && <ChangelogErrorMessage>{error}</ChangelogErrorMessage>}

      {!loading && !error && (
        <ChangelogContent>
          <Markdown>{changelog}</Markdown>
        </ChangelogContent>
      )}
    </ChangelogContainer>
  );
};
