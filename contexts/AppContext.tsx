import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ItemStatus = "available" | "pending" | "in-use" | "maintenance";
export type ItemCategory = "power" | "garden" | "cleaning" | "hand";

export interface ToolItem {
  id: string;
  ownerId: string;
  name: string;
  category: ItemCategory;
  dailyPrice: number;
  estimatedValue: number;
  description: string;
  photos: string[];
  status: ItemStatus;
  location: { lat: number; lng: number; address: string };
  vouchPlus: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Rental {
  id: string;
  itemId: string;
  itemName: string;
  borrowerId: string;
  lenderId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  depositAmount: number;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  handoverPin?: string;
  pinEntered?: boolean;
  returnPhotoUri?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  rentalId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  phone?: string;
  trustScore: number;
  verified: boolean;
  vouchPlus: boolean;
  responseTime: string;
  totalRentals: number;
  memberSince: string;
  rating: number;
}

interface AppState {
  currentUser: User;
  items: ToolItem[];
  rentals: Rental[];
  messages: Message[];
  showVouchPlus: boolean;
}

interface AppContextValue extends AppState {
  addItem: (item: Omit<ToolItem, "id" | "ownerId" | "createdAt" | "rating" | "reviewCount" | "status">) => void;
  updateItemStatus: (itemId: string, status: ItemStatus) => void;
  createRental: (rental: Omit<Rental, "id" | "createdAt" | "handoverPin">) => Rental;
  enterHandoverPin: (rentalId: string, pin: string) => boolean;
  uploadReturnPhoto: (rentalId: string, uri: string) => void;
  sendMessage: (rentalId: string, text: string) => void;
  setShowVouchPlus: (show: boolean) => void;
  upgradeToVouchPlus: () => void;
}

const defaultUser: User = {
  id: "user-1",
  name: "Alex Rivera",
  avatar: undefined,
  email: "alex@example.com",
  trustScore: 87,
  verified: true,
  vouchPlus: false,
  responseTime: "< 1 hour",
  totalRentals: 12,
  memberSince: "March 2024",
  rating: 4.8,
};

const sampleItems: ToolItem[] = [
  // ── Neighbour listings (not owned by user-1) ──────────────────────────────
  {
    id: "item-1",
    ownerId: "user-2",
    name: "DeWalt Circular Saw",
    category: "power",
    dailyPrice: 25,
    estimatedValue: 180,
    description: "7-1/4 inch blade, perfect condition. Great for decking and framing projects.",
    photos: [
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "available",
    location: { lat: 37.774, lng: -122.419, address: "Mission District, SF" },
    vouchPlus: true,
    rating: 4.9,
    reviewCount: 14,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "item-2",
    ownerId: "user-3",
    name: "Pressure Washer 2000 PSI",
    category: "cleaning",
    dailyPrice: 35,
    estimatedValue: 220,
    description: "Electric pressure washer with 25ft hose. Perfect for driveways and decks.",
    photos: [
      "https://images.unsplash.com/photo-1581579185169-2fd5d7d9ed1d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527430253228-e93688616381?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "available",
    location: { lat: 37.776, lng: -122.422, address: "Castro, SF" },
    vouchPlus: true,
    rating: 4.7,
    reviewCount: 8,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "item-3",
    ownerId: "user-4",
    name: "Garden Tiller",
    category: "garden",
    dailyPrice: 40,
    estimatedValue: 350,
    description: "Front-tine tiller, 12 inch tilling width. Prepped for spring season.",
    photos: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "available",
    location: { lat: 37.770, lng: -122.425, address: "Noe Valley, SF" },
    vouchPlus: false,
    rating: 4.6,
    reviewCount: 5,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "item-4",
    ownerId: "user-5",
    name: "Power Drill Kit",
    category: "power",
    dailyPrice: 15,
    estimatedValue: 120,
    description: "Cordless 20V drill with 2 batteries and full bit set.",
    photos: [
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "available",
    location: { lat: 37.772, lng: -122.417, address: "Potrero Hill, SF" },
    vouchPlus: false,
    rating: 4.8,
    reviewCount: 22,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "item-5",
    ownerId: "user-2",
    name: "Leaf Blower",
    category: "garden",
    dailyPrice: 12,
    estimatedValue: 80,
    description: "Electric corded leaf blower. 200 MPH airspeed. Cord included.",
    photos: [
      "https://images.unsplash.com/photo-1598514982871-5b15e9f6c7e5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1605276374054-07f8f8c6b2ef?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "in-use",
    location: { lat: 37.779, lng: -122.412, address: "SoMa, SF" },
    vouchPlus: false,
    rating: 4.4,
    reviewCount: 9,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "item-6",
    ownerId: "user-3",
    name: "Wet/Dry Vacuum 12 Gal",
    category: "cleaning",
    dailyPrice: 18,
    estimatedValue: 95,
    description: "Heavy duty shop vac with all attachments. Great for construction cleanup.",
    photos: [
      "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "available",
    location: { lat: 37.768, lng: -122.420, address: "Bernal Heights, SF" },
    vouchPlus: false,
    rating: 4.5,
    reviewCount: 11,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // ── Alex's own tools (user-1 / "My Garage") ──────────────────────────────
  {
    id: "item-u1-1",
    ownerId: "user-1",
    name: "Milwaukee Impact Driver",
    category: "power",
    dailyPrice: 20,
    estimatedValue: 200,
    description: "M18 18V cordless impact driver with 2 batteries. Torque up to 1800 in-lbs. Perfect for any fastening job.",
    photos: [
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "in-use",
    location: { lat: 37.773, lng: -122.418, address: "Mission District, SF" },
    vouchPlus: false,
    rating: 4.9,
    reviewCount: 7,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "item-u1-2",
    ownerId: "user-1",
    name: "Honda Pressure Washer",
    category: "cleaning",
    dailyPrice: 45,
    estimatedValue: 420,
    description: "2800 PSI gas-powered pressure washer. Great for driveways, decks and wood fences.",
    photos: [
      "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "available",
    location: { lat: 37.773, lng: -122.418, address: "Mission District, SF" },
    vouchPlus: false,
    rating: 4.7,
    reviewCount: 4,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "item-u1-3",
    ownerId: "user-1",
    name: "Oscillating Multi-Tool",
    category: "hand",
    dailyPrice: 18,
    estimatedValue: 130,
    description: "Variable speed oscillating tool with 40-piece accessory kit. Perfect for precision cuts and sanding.",
    photos: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "available",
    location: { lat: 37.773, lng: -122.418, address: "Mission District, SF" },
    vouchPlus: false,
    rating: 0,
    reviewCount: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const sampleRentals: Rental[] = [
  // Alex BORROWING – completed
  {
    id: "rental-s1",
    itemId: "item-1",
    itemName: "DeWalt Circular Saw",
    borrowerId: "user-1",
    lenderId: "user-2",
    startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString(),
    totalPrice: 75,
    depositAmount: 45,
    status: "completed",
    handoverPin: "4821",
    pinEntered: true,
    createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rental-s2",
    itemId: "item-4",
    itemName: "Power Drill Kit",
    borrowerId: "user-1",
    lenderId: "user-5",
    startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    totalPrice: 30,
    depositAmount: 30,
    status: "completed",
    handoverPin: "7293",
    pinEntered: true,
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Alex LENDING – active (tool is out right now)
  {
    id: "rental-s3",
    itemId: "item-u1-1",
    itemName: "Milwaukee Impact Driver",
    borrowerId: "user-4",
    lenderId: "user-1",
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    totalPrice: 60,
    depositAmount: 50,
    status: "active",
    handoverPin: "3156",
    pinEntered: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Alex LENDING – completed
  {
    id: "rental-s4",
    itemId: "item-u1-2",
    itemName: "Honda Pressure Washer",
    borrowerId: "user-3",
    lenderId: "user-1",
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    totalPrice: 90,
    depositAmount: 105,
    status: "completed",
    handoverPin: "5847",
    pinEntered: true,
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Alex BORROWING – confirmed (upcoming, PIN issued)
  {
    id: "rental-s5",
    itemId: "item-3",
    itemName: "Garden Tiller",
    borrowerId: "user-1",
    lenderId: "user-4",
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalPrice: 80,
    depositAmount: 87,
    status: "confirmed",
    handoverPin: "2941",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [items, setItems] = useState<ToolItem[]>(sampleItems);
  const [rentals, setRentals] = useState<Rental[]>(sampleRentals);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showVouchPlus, setShowVouchPlus] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("vouch_user").then((data) => {
      if (data) setCurrentUser(JSON.parse(data));
    });
    AsyncStorage.getItem("vouch_items_v3").then((data) => {
      if (data) setItems(JSON.parse(data));
    });
    AsyncStorage.getItem("vouch_rentals_v2").then((data) => {
      if (data) setRentals(JSON.parse(data));
    });
    AsyncStorage.getItem("vouch_messages").then((data) => {
      if (data) setMessages(JSON.parse(data));
    });
  }, []);

  const persistUser = useCallback((user: User) => {
    setCurrentUser(user);
    AsyncStorage.setItem("vouch_user", JSON.stringify(user));
  }, []);

  const persistItems = useCallback((newItems: ToolItem[]) => {
    setItems(newItems);
    AsyncStorage.setItem("vouch_items_v3", JSON.stringify(newItems));
  }, []);

  const persistRentals = useCallback((newRentals: Rental[]) => {
    setRentals(newRentals);
    AsyncStorage.setItem("vouch_rentals_v2", JSON.stringify(newRentals));
  }, []);

  const persistMessages = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
    AsyncStorage.setItem("vouch_messages", JSON.stringify(newMessages));
  }, []);

  const addItem = useCallback(
    (itemData: Omit<ToolItem, "id" | "ownerId" | "createdAt" | "rating" | "reviewCount" | "status">) => {
      const newItem: ToolItem = {
        ...itemData,
        id: `item-${Date.now()}`,
        ownerId: currentUser.id,
        status: "available",
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };
      persistItems([...items, newItem]);
    },
    [items, currentUser.id, persistItems]
  );

  const updateItemStatus = useCallback(
    (itemId: string, status: ItemStatus) => {
      persistItems(items.map((i) => (i.id === itemId ? { ...i, status } : i)));
    },
    [items, persistItems]
  );

  const createRental = useCallback(
    (rentalData: Omit<Rental, "id" | "createdAt" | "handoverPin">): Rental => {
      const pin = String(Math.floor(1000 + Math.random() * 9000));
      const rental: Rental = {
        ...rentalData,
        id: `rental-${Date.now()}`,
        handoverPin: pin,
        createdAt: new Date().toISOString(),
      };
      persistRentals([...rentals, rental]);
      persistItems(items.map((i) => (i.id === rentalData.itemId ? { ...i, status: "pending" } : i)));
      return rental;
    },
    [rentals, items, persistRentals, persistItems]
  );

  const enterHandoverPin = useCallback(
    (rentalId: string, pin: string): boolean => {
      const rental = rentals.find((r) => r.id === rentalId);
      if (!rental || rental.handoverPin !== pin) return false;
      persistRentals(
        rentals.map((r) =>
          r.id === rentalId ? { ...r, status: "active", pinEntered: true } : r
        )
      );
      persistItems(items.map((i) => (i.id === rental.itemId ? { ...i, status: "in-use" } : i)));
      return true;
    },
    [rentals, items, persistRentals, persistItems]
  );

  const uploadReturnPhoto = useCallback(
    (rentalId: string, uri: string) => {
      const rental = rentals.find((r) => r.id === rentalId);
      persistRentals(
        rentals.map((r) =>
          r.id === rentalId ? { ...r, returnPhotoUri: uri, status: "completed" } : r
        )
      );
      if (rental) {
        persistItems(items.map((i) => (i.id === rental.itemId ? { ...i, status: "available" } : i)));
      }
    },
    [rentals, items, persistRentals, persistItems]
  );

  const sendMessage = useCallback(
    (rentalId: string, text: string) => {
      const msg: Message = {
        id: `msg-${Date.now()}`,
        rentalId,
        senderId: currentUser.id,
        text,
        timestamp: new Date().toISOString(),
      };
      persistMessages([...messages, msg]);
    },
    [messages, currentUser.id, persistMessages]
  );

  const upgradeToVouchPlus = useCallback(() => {
    persistUser({ ...currentUser, vouchPlus: true });
  }, [currentUser, persistUser]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        items,
        rentals,
        messages,
        showVouchPlus,
        addItem,
        updateItemStatus,
        createRental,
        enterHandoverPin,
        uploadReturnPhoto,
        sendMessage,
        setShowVouchPlus,
        upgradeToVouchPlus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
