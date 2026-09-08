import React, { useState, useCallback, useEffect} from 'react';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { UserData } from '../types';
import { StorageService } from '../services/StorageService';
import { SectionHeader } from '../styles/SharedStyles';
import { useI18n } from '../i18n';
import { UserInfoCard, InfoItem, UserInfoIconButton } from '../styles/ui.styles';

const storageService = new StorageService();

interface UserInfoSectionProps {
  userData: UserData;
  addressesCount: number;
  copyToClipboard: (text: string, event?: MouseEvent) => void;
}

export const UserInfoSection: React.FC<UserInfoSectionProps> = ({
  userData,
  addressesCount,
  copyToClipboard
}) => {
  const { t } = useI18n();
  const [hideUserInfo, setHideUserInfo] = useState(false);
  useEffect(() => {
    const fetchHideUserInfo = async () => {
      const storedHideUserInfo = await storageService.getHideUserInfo();
      setHideUserInfo(storedHideUserInfo);
    };

    fetchHideUserInfo();
  }, []);

  const toggleHideUserInfo = useCallback(() => {
    setHideUserInfo(prev => {
      const newState = !prev;
      storageService.setHideUserInfo(newState);
      return newState;
    });
  }, []);

  return (
    <UserInfoCard>
      <SectionHeader style={hideUserInfo ? { marginBottom: 0 } : undefined}>
        <h2 id="user-info-heading">{t('userInfo.title')}</h2>
        <UserInfoIconButton
          onClick={toggleHideUserInfo}
          aria-label={hideUserInfo ? t('userInfo.show') : t('userInfo.hide')}
          aria-expanded={!hideUserInfo}
          aria-controls="user-info-content"
        >
          {hideUserInfo ? <MdVisibility /> : <MdVisibilityOff />}
        </UserInfoIconButton>
      </SectionHeader>
      {!hideUserInfo && (
        <div id="user-info-content" aria-labelledby="user-info-heading">
          <InfoItem>
            <label className="highlight" id="username-label">{t('userInfo.username')}</label>
            <div
              onClick={(e) => copyToClipboard(`${userData.user.username}@duck.com`, e.nativeEvent)}
              role="button"
              aria-labelledby="username-label"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  copyToClipboard(`${userData.user.username}@duck.com`, e.nativeEvent as unknown as MouseEvent);
                }
              }}
            >
              <span>{userData.user.username}@duck.com</span>
            </div>
          </InfoItem>
          <InfoItem>
            <label className="highlight" id="email-label">{t('userInfo.email')}</label>
            <div
              onClick={(e) => copyToClipboard(userData.user.email, e.nativeEvent)}
              role="button"
              aria-labelledby="email-label"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  copyToClipboard(userData.user.email, e.nativeEvent as unknown as MouseEvent);
                }
              }}
            >
              <span>{userData.user.email}</span>
            </div>
          </InfoItem>
          <InfoItem>
            <label className="highlight" id="count-label">{t('userInfo.totalGenerated')}</label>
            <div aria-labelledby="count-label">
              <span>{addressesCount}</span>
            </div>
          </InfoItem>
          {userData.invites.length > 0 && (
            <InfoItem>
              <label id="invites-label">{t('userInfo.invites')}</label>
              <div aria-labelledby="invites-label">
                <span>{userData.invites.length}</span>
              </div>
            </InfoItem>
          )}
        </div>
      )}
    </UserInfoCard>
  );
};
