import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NotificationContainer } from '../styles/ui.styles';

interface NotificationProps {
  message: string;
  position?: { x: number; y: number };
  duration?: number;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  position,
  duration = 1500,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return createPortal(
    <NotificationContainer position={position}>
      {message}
    </NotificationContainer>,
    document.body
  );
};

interface NotificationItem {
  id: string;
  message: string;
  position?: { x: number; y: number };
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showNotification = (message: string, event?: MouseEvent) => {
    const id = Math.random().toString(36).substring(2, 9);
    const position = event ? { x: event.clientX + 10, y: event.clientY + 10 } : undefined;

    setNotifications(prev => [...prev, { id, message, position }]);
  };

  const NotificationRenderer = () => (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          position={notification.position}
          onClose={() => setNotifications(prev => prev.filter(item => item.id !== notification.id))}
        />
      ))}
    </>
  );

  return { showNotification, NotificationRenderer };
};
