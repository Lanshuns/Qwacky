import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useApp } from "../context/AppContext";
import { DuckService } from "../services/DuckService";
import { useNotification } from "../components/Notification";
import { UserInfoSection } from "../components/UserInfoSection";
import { AddressListSection } from "../components/AddressListSection";

const Container = styled.div`
  padding: 16px 20px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: ${(props) => props.theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 24px;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

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
        showNotification("New address generated and copied to clipboard!");
        
        setAutoEditAddress(response.address);
      } else {
        showNotification("Failed to generate address: " + (response.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error generating address:", error);
      showNotification("An error occurred while generating the address");
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
        showNotification("Notes updated successfully");
      } else {
        showNotification("Failed to update notes");
      }
    } catch (error) {
      console.error("Error updating notes:", error);
      showNotification("An error occurred while updating notes");
    }
  };

  const handleDeleteAddress = async (addressValue: string) => {
    try {
      const success = await duckService.deleteAddress(addressValue);
      
      if (success) {
        setAddresses(addresses.filter(addr => addr.value !== addressValue));
        showNotification("Address deleted successfully");
      } else {
        showNotification("Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      showNotification("An error occurred while deleting the address");
    }
  };

  const handleClearAllAddresses = async () => {
    try {
      const success = await duckService.clearAllAddresses();
      
      if (success) {
        setAddresses([]);
        setAddressesCount(0);
        showNotification("All addresses cleared successfully");
      } else {
        showNotification("Failed to clear addresses");
      }
    } catch (error) {
      console.error("Error clearing addresses:", error);
      showNotification("An error occurred while clearing addresses");
    }
  };

  if (!userData) return null;

  return (
    <Container>
      <UserInfoSection 
        userData={userData}
        addressesCount={addressesCount}
        copyToClipboard={copyToClipboard}
      />
      <Button onClick={generateNewAddress} disabled={loading}>
        {loading ? "Generating..." : "Generate New Address"}
      </Button>
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
    </Container>
  );
};
