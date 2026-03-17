import React from 'react';
import { MdAdd, MdSend } from 'react-icons/md';
import { TabsContainer, Tab } from '../styles/DashboardTabs.styles';

interface DashboardTabsProps {
  activeTab: 'generate' | 'send';
  onTabChange: (tab: 'generate' | 'send') => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <TabsContainer role="tablist">
      <Tab
        active={activeTab === 'generate'}
        onClick={() => onTabChange('generate')}
        aria-selected={activeTab === 'generate'}
        role="tab"
      >
        <MdAdd /> Generate
      </Tab>
      <Tab
        active={activeTab === 'send'}
        onClick={() => onTabChange('send')}
        aria-selected={activeTab === 'send'}
        role="tab"
      >
        <MdSend /> Send
      </Tab>
    </TabsContainer>
  );
};
