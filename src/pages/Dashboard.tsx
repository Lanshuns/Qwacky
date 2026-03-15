import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { DuckService } from "../services/DuckService";
import { useNotification } from "../components/Notification";
import { UserInfoSection } from "../components/UserInfoSection";
import { AddressListSection } from "../components/AddressListSection";
import { DashboardContainer, GenerateButton } from "../styles/pages.styles";

interface StoredAddress {
  value: string;
  timestamp: number;
  notes?: string;
}

export const Dashboard = () => {
  const { userData, currentAccount } = useApp();
  const [addresses, setAddresses] = useState<StoredAddress[]>([]);
  const [addressesCount, setAddressesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [autoEditAddress, setAutoEditAddress] = useState<string | null>(null);
  const duckService = new DuckService();
  const { showNotification, NotificationRenderer } = useNotification();

  useEffect(() => {
    if (userData) {
      setAddressesCount(userData.stats.addresses_generated);

      const loadAddresses = async () => {
        try {
          const addresses = await duckService.getAddresses();
          setAddresses(addresses);
        } catch (error) {
          console.error('Error loading addresses:', error);
          setAddresses([]);
        }
      };

      loadAddresses();
    } else {
      setAddresses([]);
    }
  }, [userData, currentAccount]);

  const copyToClipboard = useCallback((text: string, event?: MouseEvent) => {
    navigator.clipboard.writeText(text);
    showNotification("Copied!", event);
  }, [showNotification]);

  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "short",
      day: "numeric",
    });
  }, []);

  const generateNewAddress = async () => {
    setLoading(true);
    try {
      const response = await duckService.generateAddress();

      if (response.status === "success" && response.address) {
        const newAddress = {
          value: response.address,
          timestamp: Date.now(),
          notes: ''
        };
        setAddresses([newAddress, ...addresses]);

        setAddressesCount((prev) => prev + 1);

        const refreshedUserData = await duckService.getUserData();
        if (refreshedUserData && refreshedUserData.stats) {
          setAddressesCount(refreshedUserData.stats.addresses_generated);
        }

        copyToClipboard(response.address + "@duck.com");

        setAutoEditAddress(response.address);
      }
    } catch (error) {
      console.error("Error generating address:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotes = async (addressValue: string, notes: string) => {
    try {
      const success = await duckService.updateAddressNotes(addressValue, notes);

      if (success) {
        setAddresses(addresses.map(addr =>
          addr.value === addressValue
            ? { ...addr, notes }
            : addr
        ));
      }
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  const handleDeleteAddress = async (addressValue: string) => {
    try {
      const success = await duckService.deleteAddress(addressValue);

      if (success) {
        setAddresses(addresses.filter(addr => addr.value !== addressValue));
      }
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleClearAllAddresses = async () => {
    try {
      const success = await duckService.clearAllAddresses();

      if (success) {
        setAddresses([]);
        setAddressesCount(0);
      }
    } catch (error) {
      console.error("Error clearing addresses:", error);
    }
  };

  if (!userData) return null;

  return (
    <DashboardContainer>
      <UserInfoSection
        userData={userData}
        addressesCount={addressesCount}
        copyToClipboard={copyToClipboard}
      />
      <GenerateButton onClick={generateNewAddress} disabled={loading}>
        {loading ? "Generating..." : "Generate New Address"}
      </GenerateButton>
      <AddressListSection
        addresses={addresses}
        copyToClipboard={copyToClipboard}
        formatTime={formatTime}
        onUpdateNotes={handleUpdateNotes}
        onDeleteAddress={handleDeleteAddress}
        onClearAllAddresses={handleClearAllAddresses}
        autoEditAddress={autoEditAddress}
        onAutoEditComplete={() => setAutoEditAddress(null)}
      />
      <NotificationRenderer />
    </DashboardContainer>
  );
};
