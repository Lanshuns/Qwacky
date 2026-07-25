import React from 'react';
import { MdAdd, MdSend } from 'react-icons/md';
import { useI18n } from '../i18n';
import { TabsContainer, Tab } from '../styles/DashboardTabs.styles';

interface DashboardTabsProps {
  activeTab: 'generate' | 'send';
  onTabChange: (tab: 'generate' | 'send') => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, onTabChange }) => {
  const { t } = useI18n();

  return (
    <TabsContainer role="tablist">
      <Tab
        active={activeTab === 'generate'}
        onClick={() => onTabChange('generate')}
        aria-selected={activeTab === 'generate'}
        role="tab"
      >
        <MdAdd /> {t('dashboard.tabGenerate')}
      </Tab>
      <Tab
        active={activeTab === 'send'}
        onClick={() => onTabChange('send')}
        aria-selected={activeTab === 'send'}
        role="tab"
      >
        <MdSend /> {t('dashboard.tabSend')}
      </Tab>
    </TabsContainer>
  );
};
