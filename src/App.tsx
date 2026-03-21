/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import Papa from 'papaparse';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, addDays, isWithinInterval, parseISO, eachDayOfInterval, isSameDay } from 'date-fns';
import { th } from 'date-fns/locale';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Upload, 
  Mail,
  CheckCircle2, 
  ChevronRight, 
  Wifi, 
  Wind, 
  Loader2,
  X,
  Search,
  Trash2,
  AlertCircle,
  Check,
  Users,
  Mountain,
  Facebook,
  ArrowUp,
  Tv,
  Utensils,
  Bath,
  Snowflake,
  Coffee,
  MessageCircle
} from 'lucide-react';

const N8N_WEBHOOK_URL = "/api/booking";
const ROOM_STATUS_WEBHOOK_URL = "/api/gas-room-status";
const N8N_CHECK_PHONE_URL = "/api/checkphone";
const N8N_CANCEL_URL = "/api/cancel";

// Fixed Spreadsheet ID
const SHEET_ID = "18enn4tE_3yCxfYha-qha6_S7ifzZ2ulRX8bnPhQrweQ";

// Theme Colors - Quiet Luxury Palette
const COLORS = {
  emerald: "#064E3B",
  gold: "#B8860B",
  offWhite: "#FAFAFA",
  cream: "#F5F5DC",
  ink: "#1A1A1A",
  muted: "#6B7280",
};

const SkeletonRoom = () => (
  <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-black/5">
    <div className="h-64 bg-slate-100 animate-pulse" />
    <div className="p-8 space-y-4">
      <div className="h-6 w-3/4 bg-slate-100 animate-pulse rounded-lg" />
      <div className="h-4 w-full bg-slate-100 animate-pulse rounded-lg" />
      <div className="h-4 w-5/6 bg-slate-100 animate-pulse rounded-lg" />
      <div className="pt-4 flex gap-4">
        <div className="h-12 flex-1 bg-slate-100 animate-pulse rounded-xl" />
        <div className="h-12 flex-1 bg-slate-100 animate-pulse rounded-xl" />
      </div>
    </div>
  </div>
);

// Helper to find value in row regardless of header casing or spaces/underscores
const getValue = (row: any, ...keys: string[]) => {
  const rowKeys = Object.keys(row);
  for (const key of keys) {
    // Exact match
    if (row[key] !== undefined) return row[key];
    
    // Case-insensitive match with normalized keys
    const normalizedKey = key.toLowerCase().replace(/[\s_]/g, '');
    const foundKey = rowKeys.find(rk => rk.toLowerCase().replace(/[\s_]/g, '') === normalizedKey);
    if (foundKey) return row[foundKey];
  }
  return "";
};

interface Room {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  price: number;
  image: string;
  images: string[];
  amenities: string[];
  capacity: string;
}

const INITIAL_ROOMS: Room[] = [
  {
    id: 'river-view',
    name: 'ห้องริมน้ำ (River View)',
    description: 'สัมผัสบรรยากาศริมโขงที่เชียงคาน ตื่นมาพร้อมสายหมอกเหนือน้ำ',
    fullDescription: 'ห้องพักริมแม่น้ำโขงที่ออกแบบมาเพื่อการพักผ่อนอย่างแท้จริง คุณจะได้ตื่นมาพบกับภาพทะเลหมอกที่ลอยอยู่เหนือผิวน้ำโขงในยามเช้า พร้อมระเบียงส่วนตัวที่กว้างขวางสำหรับการนั่งจิบกาแฟชมวิว ภายในตกแต่งด้วยไม้ธรรมชาติที่ให้ความรู้สึกอบอุ่นและผ่อนคลาย',
    price: 2500,
    image: 'https://lh3.googleusercontent.com/d/11Nm2aToAFeSVo2fAfNEJnYgjvhbBrnoB',
    images: [
      'https://lh3.googleusercontent.com/d/11Nm2aToAFeSVo2fAfNEJnYgjvhbBrnoB',
      'https://lh3.googleusercontent.com/d/1bODjlpAZmB7wM2wU4mwrrRYzoyboJDqE',
      'https://lh3.googleusercontent.com/d/1M0rr1O6gkeLQ5-bxUMQuPSIjUCvzA9pL',
    ],
    amenities: ['Wifi', 'เครื่องปรับอากาศ', 'ระเบียงส่วนตัว', 'อาหารเช้า', 'ตู้เย็น', 'ไดร์เป่าผม'],
    capacity: '2 ท่าน'
  },
  {
    id: 'tree-house',
    name: 'บ้านต้นไม้ (Tree House)',
    description: 'บ้านไม้บนต้นไม้ใหญ่ที่ภูเรือ ให้ความรู้สึกอบอุ่นและเป็นส่วนตัว',
    fullDescription: 'ประสบการณ์การพักผ่อนที่ไม่เหมือนใครบนบ้านต้นไม้ที่โอบล้อมด้วยแมกไม้เขียวขจีที่ภูเรือ ตัวบ้านสร้างจากไม้ทั้งหลัง มีอ่างอาบน้ำที่สามารถมองเห็นวิวภูเขาได้จากหน้าต่างบานใหญ่ เหมาะสำหรับคู่รักที่ต้องการความเป็นส่วนตัวและบรรยากาศโรแมนติก',
    price: 3200,
    image: 'https://picsum.photos/seed/treehouse1/800/600',
    images: [
      'https://picsum.photos/seed/treehouse1/800/600',
      'https://picsum.photos/seed/treehouse2/800/600',
      'https://picsum.photos/seed/treehouse3/800/600',
    ],
    amenities: ['Wifi', 'อ่างอาบน้ำ', 'วิวภูเขา', 'อาหารเช้า', 'มินิบาร์', 'ระเบียงชมดาว'],
    capacity: '2 ท่าน'
  },
  {
    id: 'misty-cabin',
    name: 'กระท่อมสายหมอก (Misty Cabin)',
    description: 'ที่พักสไตล์นอร์ดิกที่ไฮตาก จุดชมทะเลหมอกที่สวยที่สุด',
    fullDescription: 'กระท่อมสไตล์นอร์ดิกที่ตั้งอยู่บนเนินเขาในไฮตาก จุดที่คุณสามารถชมทะเลหมอกได้แบบ 360 องศาจากเตียงนอน การออกแบบเน้นความโปร่งโล่งด้วยกระจกบานใหญ่เพื่อให้คุณไม่พลาดทุกช่วงเวลาของธรรมชาติที่สวยงาม',
    price: 2800,
    image: 'https://picsum.photos/seed/mist1/800/600',
    images: [
      'https://picsum.photos/seed/mist1/800/600',
      'https://picsum.photos/seed/mist2/800/600',
      'https://picsum.photos/seed/mist3/800/600',
    ],
    amenities: ['Wifi', 'เครื่องทำน้ำอุ่น', 'จุดชมวิว', 'อาหารเช้า', 'กาต้มน้ำไฟฟ้า', 'พื้นที่นั่งเล่น'],
    capacity: '2 ท่าน'
  },
  {
    id: 'wood-suite',
    name: 'เรือนไม้พรีเมียม (Wood Suite)',
    description: 'เรือนไม้สักทองแบบดั้งเดิม ผสมผสานความทันสมัยอย่างลงตัว',
    fullDescription: 'ที่สุดของความหรูหราในสไตล์ไทยร่วมสมัย เรือนไม้สักทองที่คัดสรรวัสดุอย่างดีที่สุด พร้อมสิ่งอำนวยความสะดวกครบครันระดับโรงแรม 5 ดาว พื้นที่ใช้สอยกว้างขวาง แยกส่วนห้องนอนและห้องนั่งเล่นอย่างชัดเจน',
    price: 4500,
    image: 'https://picsum.photos/seed/wood1/800/600',
    images: [
      'https://picsum.photos/seed/wood1/800/600',
      'https://picsum.photos/seed/wood2/800/600',
      'https://picsum.photos/seed/wood3/800/600',
    ],
    amenities: ['Wifi', 'Smart TV', 'มินิบาร์', 'อาหารเช้าพรีเมียม', 'อ่างอาบน้ำจากุซซี่', 'เครื่องชงกาแฟ'],
    capacity: '2 ท่าน'
  }
];

// Helper to convert Google Drive links to direct image links
const getDirectLink = (url: string | undefined) => {
  if (!url) return "";
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "";
  
  // Handle Google Drive links
  if (trimmedUrl.includes('drive.google.com') || trimmedUrl.includes('docs.google.com/file/d/')) {
    let fileId = '';
    
    // Pattern 1: /d/FILE_ID/
    if (trimmedUrl.includes('/d/')) {
      fileId = trimmedUrl.split('/d/')[1]?.split('/')[0] || '';
    } 
    // Pattern 2: id=FILE_ID
    else if (trimmedUrl.includes('id=')) {
      fileId = trimmedUrl.split('id=')[1]?.split('&')[0] || '';
    }
    // Pattern 3: open?id=FILE_ID
    else if (trimmedUrl.includes('open?id=')) {
      fileId = trimmedUrl.split('open?id=')[1]?.split('&')[0] || '';
    }

    if (fileId) {
      // lh3.googleusercontent.com is generally more reliable for direct embedding
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  
  // Handle already direct links or other sources
  return trimmedUrl;
};

export default function App() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [socialId, setSocialId] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [slipFile, setSlipFile] = useState<File | Blob | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [urlUserId, setUrlUserId] = useState<string>('');
  const [facebookId, setFacebookId] = useState<string>('');
  const [bookedDates, setBookedDates] = useState<{[roomName: string]: Date[]}>({});
  const [roomStatuses, setRoomStatuses] = useState<{[roomName: string]: string}>({});
  const [gasBookings, setGasBookings] = useState<any[]>([]);
  const [n8nError, setN8nError] = useState<string | null>(null);

  // New States for Search and Cancel
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState<{
    customerName: string;
    roomName: string;
    rowNumber: number;
    checkIn?: string | number;
    checkOut?: string | number;
    bookingId?: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Extract userId and fbid from URL parameters
  useEffect(() => {
    const userId = searchParams.get('userId');
    const fbid = searchParams.get('fbid');
    
    if (userId) {
      setUrlUserId(userId);
      setSocialId(userId); // Pre-fill socialId with userId (Line ID)
    }
    if (fbid) {
      setFacebookId(fbid);
      if (!userId) setSocialId(fbid); // Pre-fill socialId with fbid if userId is not present
    }
  }, [searchParams]);

  // Fetch rooms from Google Sheets
  useEffect(() => {
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
    console.log('Fetching Rooms from Sheet URL:', sheetUrl);
    setIsRoomsLoading(true);
    setRooms([]); // Clear existing rooms to avoid showing old data

    Papa.parse(sheetUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('Raw Sheet Data:', results.data);
        
        const parsedRooms = results.data.map((row: any) => {
          const roomId = getValue(row, 'Room_ID', 'id', 'Room ID');
          if (!roomId) return null;

          // Clean price: remove "บาท/คืน", commas, and spaces
          const rawPrice = getValue(row, 'Price_Per_Night', 'price', 'Price', 'Price Per Night');
          const cleanPrice = Number(rawPrice.toString().replace(/[^\d]/g, '')) || 0;

          // Handle multiple links in Image_URL or Gallery_URLs
          const rawImageUrl = getValue(row, 'Image_URL', 'image', 'Image URL', 'Image');
          const rawGalleryUrl = getValue(row, 'Gallery_URLs', 'gallery', 'Gallery URLs', 'Gallery');
          
          // Split by comma, semicolon, or newline
          const splitLinks = (str: any) => {
            if (!str) return [];
            return str.toString()
              .split(/[,;\n]/)
              .map((s: string) => s.trim())
              .filter(Boolean);
          };

          const imageUrlsRaw = splitLinks(rawImageUrl);
          const galleryUrlsRaw = splitLinks(rawGalleryUrl);
          
          // Use Gallery_URLs if provided, otherwise use all from Image_URL
          const allImages = galleryUrlsRaw.length > 0 ? galleryUrlsRaw : imageUrlsRaw;
          const mainImage = imageUrlsRaw[0] || "";

          // Handle Capacity and Amenities based on user's specific sheet structure
          // Column H (People) = Capacity in UI
          // Column D (Capacity) = Amenities in UI
          const rawPeople = getValue(row, 'People', 'จำนวนผู้เข้าพัก', 'Guest').toString();
          const rawCapacityCol = getValue(row, 'Capacity', 'capacity').toString();
          
          // In user's sheet, 'Capacity' column actually contains amenities
          const hasAmenitiesInCapacity = rawCapacityCol.includes(',') || rawCapacityCol.includes('แอร์') || rawCapacityCol.includes('Wifi');
          
          const rawAmenities = getValue(row, 'Amenities', 'amenities');
          const sheetAmenities = rawAmenities 
            ? rawAmenities.toString().split(',').map((s: string) => s.trim()) 
            : (hasAmenitiesInCapacity ? rawCapacityCol.split(',').map((s: string) => s.trim()) : []);

          return {
            id: roomId.toString(),
            name: getValue(row, 'Room_Name', 'name', 'Room Name') || "Unnamed Room",
            description: getValue(row, 'Description', 'description') || "",
            fullDescription: getValue(row, 'Full_Description', 'Full Description') || getValue(row, 'Description', 'description') || "",
            price: cleanPrice,
            image: mainImage,
            images: allImages.length > 0 ? allImages : [mainImage],
            amenities: sheetAmenities,
            capacity: rawPeople || (hasAmenitiesInCapacity ? "" : rawCapacityCol)
          };
        }).filter((room: any) => room !== null);

        console.log('Parsed Rooms Count:', parsedRooms.length);
        if (parsedRooms.length > 0) {
          setRooms(parsedRooms);
        } else {
          console.warn('No valid rooms found in sheet data.');
        }
        setIsRoomsLoading(false);
      },
      error: (error) => {
        console.error('Error fetching sheet data:', error);
        setIsRoomsLoading(false);
      }
    });
  }, []);

  // Fetch Room Statuses from GAS (Google Apps Script)
  const updateRoomButtons = async () => {
    try {
      console.log(`[${new Date().toISOString()}] Attempting to fetch room status from: ${ROOM_STATUS_WEBHOOK_URL}`);
      const response = await fetch(ROOM_STATUS_WEBHOOK_URL);
      
      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[${new Date().toISOString()}] GAS room status fetch failed with status: ${response.status}. Details: ${errText}`);
        return;
      }
      
      const text = await response.text();
      console.log(`[${new Date().toISOString()}] Received GAS room status response, length: ${text.length}`);
      
      if (!text || text.trim() === "") {
        console.warn(`[${new Date().toISOString()}] GAS room status returned an empty response`);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error(`[${new Date().toISOString()}] Expected JSON from GAS but received:`, text.substring(0, 100));
        return;
      }
      
      if (Array.isArray(data)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Helper to parse dates from GAS
        const parseGasDate = (dateStr: any) => {
          if (!dateStr) return null;
          const str = dateStr.toString().trim();
          let d = parseISO(str);
          if (!isNaN(d.getTime())) return d;
          
          const parts = str.split('/');
          if (parts.length === 3) {
            d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            if (!isNaN(d.getTime())) return d;
          }
          return new Date(str);
        };

        // Filter out past bookings (UI Filtering Only)
        const activeBookings = data.filter(item => {
          const checkOutStr = item['เช็คเอาท์'] || item['Check-out'] || item['checkOut'];
          const checkOutDate = parseGasDate(checkOutStr);
          return checkOutDate && checkOutDate >= today;
        });

        console.log(`[${new Date().toISOString()}] Active Bookings from GAS:`, activeBookings.length);
        setGasBookings(activeBookings);

        // Update current status map for UI hints (optional, but requested to keep it clean)
        const statusMap: {[roomName: string]: string} = {};
        activeBookings.forEach(item => {
          const roomName = item['ห้องที่จอง'] || item['Room_Name'] || item['name'];
          const status = item['สถานะห้อง'] || item['Status'] || item['status'];
          const checkInDate = parseGasDate(item['เช็คอิน'] || item['Check-in']);
          const checkOutDate = parseGasDate(item['เช็คเอาท์'] || item['Check-out']);
          
          // If currently occupied
          if (roomName && checkInDate && checkOutDate && today >= checkInDate && today < checkOutDate) {
            statusMap[roomName.toString().trim()] = "จองแล้ว";
          }
        });
        setRoomStatuses(statusMap);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in updateRoomButtons:`, error);
    }
  };

  useEffect(() => {
    updateRoomButtons();
    // Refresh status every 2 minutes
    const interval = setInterval(updateRoomButtons, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch bookings from Google Sheets (Bookings tab)
  useEffect(() => {
    const bookingsUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Bookings`;
    console.log('Fetching Bookings from Sheet URL:', bookingsUrl);
    
    Papa.parse(bookingsUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('Raw Bookings Data:', results.data);
        const bookings = results.data;
        const disabledDatesMap: {[roomName: string]: Date[]} = {};
        
        bookings.forEach((row: any) => {
          const status = getValue(row, 'สถานะห้อง', 'สะถานะห้อง', 'สถานะ', 'Status', 'status');
          // Check for 'จองแล้ว' status
          const statusStr = status?.toString().trim();
          if (statusStr === 'จองแล้ว' || statusStr?.toLowerCase() === 'paid') {
            const roomName = getValue(row, 'ห้องที่จอง', 'ห้องพัก', 'Room', 'room', 'Room Name', 'roomName');
            const checkInStr = getValue(row, 'เช็คอิน', 'วันที่เช็คอิน', 'Check-in', 'checkIn', 'check-in', 'Check In');
            const checkOutStr = getValue(row, 'เช็คเอาท์', 'วันที่เช็คเอาท์', 'Check-out', 'checkOut', 'check-out', 'Check Out');
            
            if (roomName && checkInStr && checkOutStr) {
              try {
                // Flexible date parsing
                const parseDate = (dateStr: string) => {
                  const str = dateStr.toString().trim();
                  // Try ISO format (YYYY-MM-DD)
                  let d = parseISO(str);
                  if (!isNaN(d.getTime())) return d;
                  
                  // Try DD/MM/YYYY
                  const parts = str.split('/');
                  if (parts.length === 3) {
                    // Assume DD/MM/YYYY
                    d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    if (!isNaN(d.getTime())) return d;
                  }
                  
                  // Fallback to native Date
                  d = new Date(str);
                  return d;
                };

                const start = parseDate(checkInStr);
                const end = parseDate(checkOutStr);
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= today) {
                  // Block the interval. For hotel bookings, checkout day is usually free,
                  // but we'll block it to be safe or until end-1 if we want to be precise.
                  // Let's block until end-1 to allow checkout day check-ins.
                  const interval = eachDayOfInterval({ 
                    start: start < today ? today : start, 
                    end: addDays(end, -1) 
                  }).filter(date => date >= today);
                  
                  if (interval.length > 0) {
                    const normalizedRoomName = roomName.toString().trim();
                    if (!disabledDatesMap[normalizedRoomName]) {
                      disabledDatesMap[normalizedRoomName] = [];
                    }
                    disabledDatesMap[normalizedRoomName].push(...interval);
                  }
                }
              } catch (e) {
                console.error('Error parsing dates for booking:', row, e);
              }
            }
          }
        });
        console.log('Disabled Dates Map:', disabledDatesMap);
        setBookedDates(disabledDatesMap);
      },
      error: (error) => {
        console.error('Error fetching bookings data:', error);
      }
    });
  }, []);

  const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob failed'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setSlipPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Compress image
        const compressedBlob = await compressImage(file);
        setSlipFile(compressedBlob);
      } catch (err) {
        console.error("Compression error:", err);
        // Fallback to original file if compression fails
        setSlipFile(file);
      }
    }
  };

  // Overlap Logic Check
  const checkRoomOverlap = () => {
    if (!selectedRoom || !checkIn || !checkOut) return false;
    
    const parseGasDate = (dateStr: any) => {
      if (!dateStr) return null;
      const str = dateStr.toString().trim();
      let d = parseISO(str);
      if (!isNaN(d.getTime())) return d;
      const parts = str.split('/');
      if (parts.length === 3) {
        d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        if (!isNaN(d.getTime())) return d;
      }
      return new Date(str);
    };

    return gasBookings.some(booking => {
      const roomName = (booking['ห้องที่จอง'] || booking['Room_Name'] || booking['name'])?.toString().trim();
      if (roomName !== selectedRoom.name.trim()) return false;

      const existingStart = parseGasDate(booking['เช็คอิน'] || booking['Check-in']);
      const existingEnd = parseGasDate(booking['เช็คเอาท์'] || booking['Check-out']);

      if (!existingStart || !existingEnd) return false;

      // Overlap Logic: (StartA < EndB) and (EndA > StartB)
      return checkIn < existingEnd && checkOut > existingStart;
    });
  };

  const isOverlap = checkRoomOverlap();

  const calculateTotalPrice = () => {
    if (!selectedRoom || !checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * selectedRoom.price : selectedRoom.price;
  };

  // 1. ฟังก์ชันส่งข้อมูลการจอง (Booking)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    // Validation: Check for empty fields
    if (!selectedRoom) {
      setValidationError("กรุณาเลือกห้องพักที่ต้องการจอง");
      return;
    }
    if (!customerName || customerName.trim() === "") {
      setValidationError("กรุณากรอกชื่อ-นามสกุลของผู้เข้าพัก");
      return;
    }
    if (!phone || phone.trim() === "") {
      setValidationError("กรุณากรอกเบอร์โทรศัพท์ติดต่อ");
      return;
    }
    
    // Validation: Phone number must be 10 digits
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setValidationError("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก (ตัวเลขเท่านั้น)");
      return;
    }

    if (!email || email.trim() === "") {
      setValidationError("กรุณากรอกอีเมลสำหรับรับข้อมูลการจอง");
      return;
    }
    if (!checkIn || !checkOut) {
      setValidationError("กรุณาเลือกวันที่เช็คอินและเช็คเอาท์");
      return;
    }
    if (!slipFile) {
      setValidationError("กรุณาอัปโหลดสลิปหลักฐานการโอนเงิน");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    formData.append('bookingId', bookingId);
    formData.append('customerName', customerName);
    formData.append('phone', phoneDigits); // Send only digits
    formData.append('email', email);
    formData.append('roomName', selectedRoom.name);
    formData.append('checkIn', format(checkIn, 'yyyy-MM-dd'));
    formData.append('checkOut', format(checkOut, 'yyyy-MM-dd'));
    formData.append('totalPrice', calculateTotalPrice().toString());
    formData.append('lineId', urlUserId);
    formData.append('facebookId', facebookId);
    formData.append('socialId', socialId);
    
    if (slipFile) {
      formData.append('slip', slipFile, 'slip.jpg');
    }

    try {
      console.log(`[${new Date().toISOString()}] Sending booking data directly to n8n...`);
      
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
        // No headers needed for FormData, browser handles it
      });

      if (response.ok) {
        console.log(`[${new Date().toISOString()}] Booking Success!`);
        setIsSuccess(true);
        // Reset form
        setCustomerName('');
        setPhone('');
        setEmail('');
        setSlipFile(null);
        setSlipPreview(null);
        setCheckIn(null);
        setCheckOut(null);
        setSelectedRoom(null);
      } else {
        const text = await response.text();
        let errorMessage = "ระบบขัดข้องชั่วคราว กรุณาติดต่อผ่าน LINE";
        
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.details || errorMessage;
        } catch (e) {
          // If not JSON, it might be a 404 or other error
          if (response.status === 404) {
            errorMessage = "ไม่พบเซิร์ฟเวอร์ปลายทาง (n8n) กรุณาตรวจสอบการตั้งค่า Webhook";
          }
        }
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error(`[${new Date().toISOString()}] Booking Error:`, err);
      
      let displayError = err.message;
      if (displayError.includes("Failed to fetch") || displayError.includes("NetworkError")) {
        displayError = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตของคุณ หรือติดต่อผ่าน LINE";
      }
      
      setError(displayError || "ระบบขัดข้องชั่วคราว กรุณาติดต่อผ่าน LINE");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. ฟังก์ชันตรวจสอบเบอร์โทรศัพท์ (Check Phone)
  const handleSearchBooking = async () => {
    if (!searchPhone) {
      setSearchError("กรุณากรอกเบอร์โทรศัพท์");
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);
    setCancelMessage(null);

    try {
      console.log(`[${new Date().toISOString()}] Checking phone: ${searchPhone} directly via n8n`);
      const response = await fetch(N8N_CHECK_PHONE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: searchPhone }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[${new Date().toISOString()}] Check Phone Result:`, data);
        if (data && data.customerName) {
          setSearchResult({
            customerName: data.customerName,
            roomName: data.roomName,
            rowNumber: data.row_number,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            bookingId: data.bookingId || data.row_number // Use row number as fallback ID
          });
        } else {
          setSearchError("ไม่พบข้อมูลการจองสำหรับเบอร์โทรศัพท์นี้");
        }
      } else {
        const text = await response.text();
        let errorMessage = "เกิดข้อผิดพลาดในการค้นหา";
        if (response.status === 404) errorMessage = "ไม่พบ Webhook สำหรับค้นหา (404)";
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error(`[${new Date().toISOString()}] Check Phone Error:`, err);
      let displayError = err.message;
      if (displayError.includes("The string did not match the expected pattern") || displayError.includes("Failed to fetch")) {
        displayError = "ถูกบล็อกโดยระบบความปลอดภัย (CORS) กรุณาตั้งค่า n8n ให้ยอมรับโดเมน Vercel หรือใช้ Shared URL จาก AI Studio";
      }
      setSearchError(displayError);
    } finally {
      setIsSearching(false);
    }
  };

  // Helper to format Google Sheets serial date or string date
  const formatSheetDate = (dateVal: string | number | undefined) => {
    if (!dateVal) return "-";
    
    let date: Date;
    
    if (typeof dateVal === 'number') {
      // Google Sheets serial date conversion
      // 25569 is the number of days between 1899-12-30 and 1970-01-01
      date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    } else {
      // Try parsing as ISO string or other format
      date = new Date(dateVal);
    }

    if (isNaN(date.getTime())) return dateVal.toString();
    
    return format(date, 'dd/MM/yyyy');
  };

  // 3. ฟังก์ชันยกเลิกการจอง (Cancel)
  const handleCancelBooking = async () => {
    if (!searchResult) return;
    
    setIsCancelling(true);
    try {
      console.log(`[${new Date().toISOString()}] Cancelling booking directly via n8n:`, searchResult);
      const response = await fetch(N8N_CANCEL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bookingId: searchResult.bookingId,
          phone: searchPhone,
          row: searchResult.rowNumber,
          action: "ยกเลิก" 
        }),
      });

      if (response.ok) {
        console.log(`[${new Date().toISOString()}] Cancel Request Sent!`);
        setCancelMessage("ส่งเรื่องยกเลิกเรียบร้อย ระบบจะแจ้งเตือนคุณผ่านแชทใน 1 นาที");
        setSearchResult(null);
        setSearchPhone('');
      } else {
        throw new Error("ไม่สามารถส่งคำขอยกเลิกได้");
      }
    } catch (err: any) {
      console.error(`[${new Date().toISOString()}] Cancel Error:`, err);
      let displayError = "ไม่สามารถเชื่อมต่อกับระบบได้";
      if (err.message.includes("The string did not match the expected pattern") || err.message.includes("Failed to fetch")) {
        displayError = "ถูกบล็อกโดยระบบความปลอดภัย (CORS) กรุณาใช้ Shared URL จาก AI Studio";
      }
      setSearchError(displayError);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans selection:bg-[#B8860B]/30">
      {/* n8n Configuration Warning */}
      {n8nError && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md bg-red-50 border-l-4 border-red-500 p-4 shadow-lg rounded-r-lg animate-bounce">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-red-800">พบปัญหาการเชื่อมต่อ n8n</h3>
              <p className="text-xs text-red-700 mt-1">{n8nError}</p>
              <button 
                onClick={() => setN8nError(null)}
                className="mt-2 text-xs font-semibold text-red-800 hover:underline"
              >
                ปิดการแจ้งเตือน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-[#B8860B]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#064E3B] rounded-full flex items-center justify-center shadow-lg shadow-[#064E3B]/20">
                <Wind className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-serif font-semibold tracking-tight text-[#064E3B]">
                Loei Misty
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-slate-600 hover:text-[#064E3B] transition-colors">ที่พัก</button>
              <button onClick={() => document.getElementById('manage-booking')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-slate-600 hover:text-[#064E3B] transition-colors">การจองของฉัน</button>
              <button 
                onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#064E3B] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#053F30] transition-all shadow-md shadow-[#064E3B]/10"
              >
                จองตอนนี้
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center bg-[#F5F5DC]/30 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#064E3B]/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#B8860B]/5 rounded-full blur-[120px]" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 text-center px-6 max-w-4xl"
          >
            <motion.span 
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.4em" }}
              transition={{ delay: 0.2, duration: 1 }}
              className="block text-[#B8860B] font-sans text-xs font-bold uppercase mb-6"
            >
              สัมผัสศิลปะแห่งการใช้ชีวิต
            </motion.span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-medium text-[#064E3B] leading-[1.1] mb-8">
              Loei Misty <br />
              <span className="italic font-normal text-[#B8860B]">Homestay</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              สัมผัสความหรูหราที่เรียบง่ายท่ามกลางทะเลหมอกและขุนเขา 
              ที่พักระดับพรีเมียมที่ออกแบบมาเพื่อการพักผ่อนอย่างแท้จริง
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative inline-flex items-center gap-3 bg-[#064E3B] text-white px-10 py-5 rounded-full text-lg font-semibold hover:bg-[#053F30] transition-all shadow-xl shadow-[#064E3B]/20 border border-[#B8860B]/20"
              >
                จองที่พักของคุณ <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => document.getElementById('manage-booking')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-slate-600 font-medium hover:text-[#064E3B] transition-colors border-b border-slate-300 hover:border-[#064E3B] pb-1"
              >
                จัดการการจอง
              </button>
            </div>
          </motion.div>
        </section>

        {/* Room Selection */}
        <section id="rooms" className="max-w-7xl mx-auto px-6 py-32 lg:px-12">
          <div className="text-center mb-20">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-[#B8860B] font-sans font-bold tracking-[0.3em] uppercase text-xs mb-4 block"
            >
              คอลเลกชันที่คัดสรรมาเพื่อคุณ
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-serif font-medium text-[#064E3B]"
            >
              ที่พักของเรา
            </motion.h2>
          </div>

          {isRoomsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3].map(i => <SkeletonRoom key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {rooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                  className={`group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#B8860B]/5 transition-all duration-500 border border-black/5 ${selectedRoom?.id === room.id ? 'ring-2 ring-[#B8860B] ring-offset-4' : 'hover:border-[#B8860B]/30'}`}
                >
                  <div className="relative h-72 overflow-hidden">
                    <img 
                      src={getDirectLink(room.image)} 
                      alt={room.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-[#064E3B] shadow-sm border border-[#B8860B]/20 font-sans">
                      ฿{room.price.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-serif font-medium text-slate-800">{room.name}</h3>
                      {room.capacity && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#B8860B] bg-[#B8860B]/5 px-2 py-1 rounded">
                          {room.capacity}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm mb-8 line-clamp-2 font-light leading-relaxed">{room.description}</p>
                    
                    <div className="flex flex-wrap gap-3 mb-10">
                      {room.amenities.slice(0, 4).map(amenity => (
                        <span key={amenity} className="text-[10px] font-medium uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-0.5">
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => {
                          setViewingRoom(room);
                          setActiveImageIndex(0);
                        }}
                        className="py-3.5 rounded-xl font-semibold text-sm text-[#064E3B] bg-slate-50 hover:bg-slate-100 transition-all text-center"
                      >
                        รายละเอียด
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedRoom(room);
                          document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`py-3.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
                          selectedRoom?.id === room.id 
                            ? 'bg-[#B8860B] text-white' 
                            : 'bg-[#064E3B] text-white hover:bg-[#053F30]'
                        }`}
                      >
                        {selectedRoom?.id === room.id ? 'เลือกแล้ว' : 'จองตอนนี้'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Booking Form Section */}
        <section id="booking-form" className="bg-[#064E3B] py-32 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-[#B8860B]/10 rounded-full translate-x-1/3 translate-y-1/3 blur-[120px]" />

          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden p-8 sm:p-16 border border-[#B8860B]/10">
              <div className="text-center mb-16">
                <span className="text-[#B8860B] font-sans font-bold tracking-[0.3em] uppercase text-xs mb-4 block">รายละเอียดการจอง</span>
                <h2 className="text-4xl font-serif font-medium text-slate-800">ข้อมูลการจอง</h2>
                <p className="text-slate-500 mt-4 font-light">กรุณาระบุข้อมูลของคุณเพื่อยืนยันการเข้าพักที่ Loei Misty</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Room Summary if selected */}
                {selectedRoom && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-50 p-6 rounded-3xl border border-black/5 flex items-center gap-6"
                  >
                    <img src={getDirectLink(selectedRoom.image)} className="w-24 h-24 rounded-2xl object-cover shadow-sm" alt="" />
                    <div>
                      <p className="text-[10px] font-bold text-[#B8860B] uppercase tracking-[0.2em] mb-1">ห้องที่เลือก</p>
                      <h4 className="text-xl font-serif font-medium text-slate-800">{selectedRoom.name}</h4>
                      <p className="text-sm text-slate-500 font-light">฿{selectedRoom.price.toLocaleString()} ต่อคืน</p>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                  {/* Name */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      ชื่อ-นามสกุล
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8860B]" />
                      <input 
                        type="text" 
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="เช่น สมชาย ใจดี"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-1 focus:ring-[#B8860B] focus:border-[#B8860B] outline-none transition-all bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      เบอร์โทรศัพท์
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8860B]" />
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0812345678"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-1 focus:ring-[#B8860B] focus:border-[#B8860B] outline-none transition-all bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      อีเมล
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8860B]" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-1 focus:ring-[#B8860B] focus:border-[#B8860B] outline-none transition-all bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Check-in */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      วันที่เช็คอิน
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8860B] z-10" />
                      <DatePicker
                        selected={checkIn}
                        onChange={(date) => setCheckIn(date)}
                        selectsStart
                        startDate={checkIn}
                        endDate={checkOut}
                        minDate={today}
                        excludeDates={selectedRoom ? bookedDates[selectedRoom.name.trim()] || [] : []}
                        placeholderText="เลือกวันที่เช็คอิน"
                        className="datepicker-input"
                        wrapperClassName="w-full"
                        dateFormat="dd/MM/yyyy"
                        locale={th}
                        required
                      />
                    </div>
                  </div>

                  {/* Check-out */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      วันที่เช็คเอาท์
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8860B] z-10" />
                      <DatePicker
                        selected={checkOut}
                        onChange={(date) => setCheckOut(date)}
                        selectsEnd
                        startDate={checkIn}
                        endDate={checkOut}
                        minDate={checkIn || today}
                        excludeDates={selectedRoom ? bookedDates[selectedRoom.name.trim()] || [] : []}
                        placeholderText="เลือกวันที่เช็คเอาท์"
                        className="datepicker-input"
                        wrapperClassName="w-full"
                        dateFormat="dd/MM/yyyy"
                        locale={th}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-[#F5F5DC]/20 p-8 sm:p-12 rounded-[2.5rem] border border-[#B8860B]/10">
                  <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="text-center lg:text-left flex-1">
                      <h3 className="text-2xl font-serif font-medium text-[#064E3B] mb-4">ข้อมูลการชำระเงิน</h3>
                      <p className="text-slate-600 text-sm mb-6 font-light leading-relaxed">
                        กรุณาโอนเงินตามยอดรวมไปยังบัญชีต่อไปนี้เพื่อยืนยันการจองของคุณ
                      </p>
                      <div className="space-y-2 mb-8">
                        <p className="text-sm text-slate-500">ธนาคาร: <span className="text-slate-800 font-medium">กสิกรไทย (K-Bank)</span></p>
                        <p className="text-sm text-slate-500">เลขที่บัญชี: <span className="text-slate-800 font-medium tracking-wider">123-4-56789-0</span></p>
                        <p className="text-sm text-slate-500">ชื่อบัญชี: <span className="text-slate-800 font-medium">บริษัท เลย มิสตี้ โฮมสเตย์ จำกัด</span></p>
                      </div>
                      <div className="bg-white p-4 inline-block rounded-[2rem] shadow-xl shadow-[#B8860B]/5 border border-black/5">
                        <img 
                          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LoeiMistyHomestay" 
                          alt="คิวอาร์โค้ดสำหรับชำระเงิน" 
                          className="w-32 h-32"
                        />
                      </div>
                    </div>

                    <div className="w-full lg:w-72">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center lg:text-left">อัปโหลดสลิปการโอนเงิน</label>
                      <div className="relative group">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`h-56 rounded-[2rem] border border-dashed flex flex-col items-center justify-center transition-all duration-500 ${slipPreview ? 'border-[#064E3B] bg-[#064E3B]/5' : 'border-slate-300 group-hover:border-[#B8860B] bg-slate-50/50'}`}>
                          {slipPreview ? (
                            <img src={slipPreview} className="h-full w-full object-contain p-4 rounded-[2rem]" alt="ตัวอย่างสลิปโอนเงิน" />
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-5 h-5 text-[#B8860B]" />
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">เลือกไฟล์</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Price & Submit */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-10 pt-12 border-t border-slate-100">
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ยอดรวมทั้งหมด</p>
                    <p className="text-4xl font-sans font-semibold text-[#064E3B]">฿{calculateTotalPrice().toLocaleString()}</p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting || isOverlap}
                    className={`w-full sm:w-auto px-16 py-5 rounded-full font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-4 ${
                      isOverlap || isSubmitting
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-[#064E3B] text-white hover:bg-[#053F30] hover:shadow-2xl hover:-translate-y-1'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> กำลังดำเนินการ...
                      </>
                    ) : isOverlap ? (
                      'ไม่ว่างในช่วงวันที่เลือก'
                    ) : (
                      <>
                        <Check className="w-6 h-6" />
                        ยืนยันการจองห้องพัก
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5" /> {error}
                  </motion.div>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* Manage Booking Section */}
        <section id="manage-booking" className="bg-[#FAFAFA] py-32">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[#B8860B] font-sans font-bold tracking-[0.3em] uppercase text-xs mb-4 block">การจัดการการจอง</span>
              <h2 className="text-4xl font-serif font-medium text-slate-800">จัดการการเข้าพักของคุณ</h2>
              <p className="text-slate-500 mt-4 font-light">กรอกเบอร์โทรศัพท์ของคุณเพื่อดูหรือยกเลิกการจอง</p>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-black/5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8860B]" />
                  <input 
                    type="tel" 
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    placeholder="กรอกเบอร์โทรศัพท์"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-1 focus:ring-[#B8860B] focus:border-[#B8860B] outline-none transition-all bg-slate-50/50"
                  />
                </div>
                <button 
                  onClick={handleSearchBooking}
                  disabled={isSearching}
                  className="px-10 py-4 bg-[#064E3B] text-white rounded-2xl font-bold hover:bg-[#053F30] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} ค้นหา
                </button>
              </div>

              {searchError && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-center text-red-500 text-sm font-medium mt-4"
                >
                  {searchError}
                </motion.p>
              )}

              {cancelMessage && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="mt-8 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl text-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-emerald-700 font-medium">{cancelMessage}</p>
                </motion.div>
              )}

              {/* Search Results */}
              <AnimatePresence>
                {searchResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-10 pt-10 border-t border-slate-100 space-y-4"
                  >
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-black/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-[#B8860B] uppercase tracking-widest mb-1">พบข้อมูลการจอง</p>
                        <h4 className="text-2xl font-serif font-medium text-slate-800">{searchResult.customerName}</h4>
                        <p className="text-slate-500 font-light mt-1">ห้อง: {searchResult.roomName}</p>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-light">
                          <p className="text-slate-600">
                            <span className="font-medium text-[#064E3B]">เช็คอิน:</span> {formatSheetDate(searchResult.checkIn)}
                          </p>
                          <p className="text-slate-600">
                            <span className="font-medium text-[#064E3B]">เช็คเอาท์:</span> {formatSheetDate(searchResult.checkOut)}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={handleCancelBooking}
                        disabled={isCancelling}
                        className="w-full sm:w-auto px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-xs uppercase tracking-widest"
                      >
                        {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        ยกเลิกการเข้าพัก
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-20">
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#B8860B] rounded-full flex items-center justify-center shadow-lg shadow-[#B8860B]/20">
                  <Mountain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-medium tracking-tight">Loei Misty</h2>
                  <p className="text-[10px] font-bold text-[#B8860B] uppercase tracking-[0.4em] mt-1">Homestay & Retreat</p>
                </div>
              </div>
              <p className="text-slate-400 font-light leading-relaxed max-w-md text-lg">
                สัมผัสความงามอันเงียบสงบของขุนเขาและสายหมอกในจังหวัดเลย ผ่านคอลเลกชันที่พักสุดหรูที่คัดสรรมาเพื่อคุณโดยเฉพาะ เพื่อมอบประสบการณ์การพักผ่อนที่ล้ำค่าที่สุด
              </p>
              <div className="flex gap-6 pt-4">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-[#B8860B] transition-all cursor-pointer group">
                  <Facebook className="w-5 h-5 text-slate-400 group-hover:text-[#B8860B]" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#B8860B]">ติดต่อเรา</h4>
                <ul className="space-y-6 text-slate-400 font-light">
                  <li className="flex items-start gap-4 hover:text-white transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#B8860B]/10 transition-colors">
                      <Phone className="w-4 h-4 text-[#B8860B]" />
                    </div>
                    <span className="pt-1">+66 81 234 5678</span>
                  </li>
                  <li className="flex items-start gap-4 hover:text-white transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#B8860B]/10 transition-colors">
                      <Mail className="w-4 h-4 text-[#B8860B]" />
                    </div>
                    <span className="pt-1">contact@loeimisty.com</span>
                  </li>
                  <li className="flex items-start gap-4 hover:text-white transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#B8860B]/10 transition-colors">
                      <MapPin className="w-4 h-4 text-[#B8860B]" />
                    </div>
                    <span className="pt-1 leading-relaxed">อ.ภูเรือ, จ.เลย, ประเทศไทย</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-8">
                <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#B8860B]">เวลาทำการ</h4>
                <ul className="space-y-4 text-slate-400 font-light">
                  <li>
                    <p className="text-white font-medium mb-1">Check-in</p>
                    <p className="text-sm">14:00 น. เป็นต้นไป</p>
                  </li>
                  <li>
                    <p className="text-white font-medium mb-1">Check-out</p>
                    <p className="text-sm">ก่อน 12:00 น.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-8 text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase">
            <p>© 2026 Loei Misty Homestay. สงวนลิขสิทธิ์.</p>
            <div className="flex gap-12">
              <span 
                onClick={() => setShowPrivacyPolicy(true)}
                className="hover:text-[#B8860B] cursor-pointer transition-colors"
              >
                นโยบายความเป็นส่วนตัว
              </span>
              <span 
                onClick={() => setShowTermsOfService(true)}
                className="hover:text-[#B8860B] cursor-pointer transition-colors"
              >
                ข้อกำหนดการให้บริการ
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsSuccess(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3rem] shadow-2xl p-12 max-w-lg w-full text-center overflow-hidden border border-[#B8860B]/20"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#064E3B]" />
              <div className="absolute top-2 left-0 w-full h-[1px] bg-[#B8860B]/30" />
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Check className="w-12 h-12 text-[#064E3B]" />
              </div>
              <h3 className="text-3xl font-serif font-medium text-slate-800 mb-4">การจองสำเร็จ</h3>
              <p className="text-slate-500 font-light leading-relaxed mb-10">
                เราได้รับข้อมูลการจองของคุณแล้ว เราจะตรวจสอบการชำระเงินและส่งข้อมูลยืนยันให้คุณในไม่ช้า
              </p>
              
              <div className="space-y-4">
                <a 
                  href={`https://line.me/R/oaMessage/@loeimisty/?${encodeURIComponent(`ยืนยันการจอง: ${customerName} เบอร์ ${phone} ห้อง ${selectedRoom?.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-5 bg-[#00B900] text-white rounded-2xl font-bold hover:bg-[#009900] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-6 h-6" />
                  รับใบยืนยันทาง LINE
                </a>

                <button 
                  onClick={() => setIsSuccess(false)}
                  className="w-full py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  ปิดหน้าต่างนี้
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Validation Error Modal */}
      <AnimatePresence>
        {validationError && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setValidationError(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3rem] shadow-2xl p-12 max-w-lg w-full text-center overflow-hidden border border-red-100"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-serif font-medium text-slate-800 mb-4">ข้อมูลไม่ครบถ้วน</h3>
              <p className="text-slate-500 font-light leading-relaxed mb-10">
                {validationError}
              </p>
              
              <button 
                onClick={() => setValidationError(null)}
                className="w-full py-5 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-lg"
              >
                ตกลง เข้าใจแล้ว
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Modal (Server Error) */}
      <AnimatePresence>
        {error && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setError(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3rem] shadow-2xl p-12 max-w-lg w-full text-center overflow-hidden border border-red-100"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <X className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-serif font-medium text-slate-800 mb-4">เกิดข้อผิดพลาด</h3>
              <p className="text-slate-500 font-light leading-relaxed mb-10">
                {error}
              </p>
              
              <div className="space-y-4">
                <a 
                  href="https://line.me/ti/p/@loeimisty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-5 bg-[#00B900] text-white rounded-2xl font-bold hover:bg-[#009900] transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-6 h-6" />
                  ติดต่อผ่าน LINE
                </a>
                <button 
                  onClick={() => setError(null)}
                  className="w-full py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  ปิด
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {showTermsOfService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowTermsOfService(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative bg-white rounded-[3rem] shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden border border-[#B8860B]/10 flex flex-col"
            >
              <div className="p-8 sm:p-12 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[#B8860B] font-sans font-bold tracking-[0.3em] uppercase text-[10px] mb-2 block">Terms & Conditions</span>
                    <h3 className="text-3xl font-serif font-medium text-slate-800">ข้อกำหนดและเงื่อนไขการให้บริการ</h3>
                  </div>
                  <button 
                    onClick={() => setShowTermsOfService(false)}
                    className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-light leading-relaxed">
                  <p>
                    ยินดีต้อนรับสู่ระบบจองที่พัก Loei Misty การใช้งานเว็บไซต์นี้ถือว่าท่านได้ตกลงและยอมรับข้อกำหนดดังต่อไปนี้:
                  </p>

                  <section className="space-y-4">
                    <h4 className="text-lg font-serif font-medium text-[#064E3B]">1. ความถูกต้องของข้อมูลการจอง:</h4>
                    <p>ผู้ใช้งานตกลงจะให้ข้อมูลที่เป็นจริงและถูกต้องในการจองที่พักเท่านั้น หากพบว่ามีการใช้ข้อมูลเท็จ หรือการแอบอ้างข้อมูลผู้อื่น เราขอสงวนสิทธิ์ในการยกเลิกรายการจองโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</p>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-lg font-serif font-medium text-[#064E3B]">2. กระบวนการจองและยืนยัน:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>สถานะห้องว่างบนเว็บไซต์เป็นข้อมูลแบบ Real-time อย่างไรก็ตาม การจองจะสมบูรณ์ต่อเมื่อระบบตรวจสอบหลักฐานการชำระเงินเรียบร้อยแล้วเท่านั้น</li>
                      <li>การยืนยันการจองจะถูกส่งผ่านระบบ [อีเมล/LINE] ตามที่ท่านได้ให้ข้อมูลไว้</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-lg font-serif font-medium text-[#064E3B]">3. การใช้งานเว็บไซต์อย่างเหมาะสม:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>ห้ามมิให้ผู้ใช้งานพยายามแทรกแซง เจาะระบบ หรือกระทำการใดๆ ที่ส่งผลกระทบต่อความเสถียรของเว็บไซต์</li>
                      <li>เราไม่อนุญาตให้ใช้โปรแกรมอัตโนมัติ (Bot) ในการดึงข้อมูลหรือสร้างรายการจองในปริมาณมากเกินปกติ</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-lg font-serif font-medium text-[#064E3B]">4. การจำกัดความรับผิดชอบ:</h4>
                    <p>แม้เราจะใช้ความพยายามอย่างเต็มที่เพื่อให้ระบบทำงานได้อย่างราบรื่น แต่เราไม่สามารถรับรองความต่อเนื่อง 100% ในกรณีที่เกิดเหตุขัดข้องทางเทคนิคเหนือการควบคุม (เช่น ระบบอินเทอร์เน็ตล่ม หรือการขัดข้องจากผู้ให้บริการคลาวด์) อย่างไรก็ตาม เราจะดำเนินการแก้ไขปัญหาให้เร็วที่สุดเพื่อรักษาผลประโยชน์ของผู้ใช้งาน</p>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-lg font-serif font-medium text-[#064E3B]">5. การเปลี่ยนแปลงข้อกำหนด:</h4>
                    <p>เราขอสงวนสิทธิ์ในการปรับปรุงหรือเปลี่ยนแปลงข้อกำหนดเหล่านี้ได้ทุกเมื่อเพื่อให้สอดคล้องกับมาตรฐานการให้บริการที่ดียิ่งขึ้น</p>
                  </section>
                </div>
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setShowTermsOfService(false)}
                  className="px-8 py-3 bg-[#064E3B] text-white rounded-xl font-bold hover:bg-[#053F30] transition-all shadow-md"
                >
                  ยอมรับเงื่อนไข
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyPolicy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowPrivacyPolicy(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative bg-white rounded-[3rem] shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden border border-[#B8860B]/10 flex flex-col"
            >
              <div className="p-8 sm:p-12 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[#B8860B] font-sans font-bold tracking-[0.3em] uppercase text-[10px] mb-2 block">Legal Information</span>
                    <h3 className="text-3xl font-serif font-medium text-slate-800">นโยบายความเป็นส่วนตัว</h3>
                  </div>
                  <button 
                    onClick={() => setShowPrivacyPolicy(false)}
                    className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-light leading-relaxed">
                  <p>
                    <strong>Loei Misty</strong> ("เรา") ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของท่าน เพื่อให้ท่านมั่นใจได้ว่าข้อมูลการจองที่พักของท่านจะถูกจัดการอย่างปลอดภัยตามมาตรฐาน พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
                  </p>

                  <section className="space-y-4">
                    <h4 className="text-lg font-serif font-medium text-[#064E3B]">ข้อมูลที่เราจัดเก็บ:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>ข้อมูลระบุตัวตน:</strong> ชื่อ-นามสกุล, เบอร์โทรศัพท์, LINE ID</li>
                      <li><strong>ข้อมูลการทำรายการ:</strong> วันที่เข้าพัก, จำนวนผู้เข้าพัก, รายละเอียดห้องพักที่ท่านเลือก</li>
                      <li><strong>หลักฐานการชำระเงิน:</strong> รูปภาพสลิปการโอนเงินเพื่อใช้ยืนยันการจอง</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-lg font-serif font-medium text-[#064E3B]">วัตถุประสงค์ในการเก็บข้อมูล:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>เพื่อดำเนินการจองและตรวจสอบสถานะห้องว่างแบบ Real-time ผ่านระบบอัตโนมัติ</li>
                      <li>เพื่อใช้ติดต่อสื่อสาร แจ้งสถานะการจอง และประสานงานการเข้าพัก</li>
                      <li>เพื่อป้องกันการจองซ้ำซ้อน (Double Booking) และรักษาความถูกต้องของข้อมูล</li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-lg font-serif font-medium text-[#064E3B]">การรักษาความปลอดภัยและระยะเวลาจัดเก็บ:</h4>
                    <p>ข้อมูลของท่านจะถูกส่งผ่านระบบที่มีการเข้ารหัสปลอดภัย และจัดเก็บไว้ในฐานข้อมูลคลาวด์มาตรฐานระดับสากล (Google Cloud Infrastructure)</p>
                    <p>เราจะจัดเก็บข้อมูลไว้เท่าที่จำเป็นสำหรับวัตถุประสงค์ในการให้บริการ และจะลบข้อมูลเมื่อสิ้นสุดระยะเวลาที่กำหนดตามกฎหมาย</p>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-lg font-serif font-medium text-[#064E3B]">สิทธิของเจ้าของข้อมูล:</h4>
                    <p>ท่านมีสิทธิขอเข้าถึง แก้ไข ลบ หรือขอให้ระงับการใช้ข้อมูลส่วนบุคคลของท่าน โดยสามารถติดต่อเจ้าหน้าที่ผ่านช่องทางที่ระบุไว้บนเว็บไซต์นี้</p>
                  </section>
                </div>
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setShowPrivacyPolicy(false)}
                  className="px-8 py-3 bg-[#064E3B] text-white rounded-xl font-bold hover:bg-[#053F30] transition-all shadow-md"
                >
                  รับทราบ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-[90] w-12 h-12 bg-[#B8860B] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[#966D09] transition-all hover:scale-110 active:scale-95"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Room Detail Modal */}
      <AnimatePresence>
        {viewingRoom && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setViewingRoom(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-[#B8860B]/10"
            >
              <button 
                onClick={() => setViewingRoom(null)}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-1/2 h-80 md:h-auto relative">
                  <img 
                    src={getDirectLink(viewingRoom.images[activeImageIndex])} 
                    className="w-full h-full object-cover"
                    alt={viewingRoom.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden" />
                  
                  {/* Gallery Navigation */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-md p-2 rounded-full">
                    {viewingRoom.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${activeImageIndex === idx ? 'bg-white w-6' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="md:w-1/2 p-10 md:p-16 overflow-y-auto">
                  <span className="text-[#B8860B] font-sans font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">ห้องพักสุดหรู</span>
                  <h3 className="text-4xl font-serif font-medium text-slate-800 mb-6">{viewingRoom.name}</h3>
                  <p className="text-slate-500 font-light leading-relaxed mb-10">
                    {viewingRoom.description || viewingRoom.fullDescription || "สัมผัสประสบการณ์การพักผ่อนที่เหนือระดับด้วยห้องพักที่ออกแบบมาอย่างพิถีพิถัน พร้อมสิ่งอำนวยความสะดวกครบครันและวิวทิวทัศน์ที่สวยงาม"}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#B8860B]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">จำนวนผู้เข้าพัก</p>
                        <p className="text-sm font-medium text-slate-700">{viewingRoom.capacity} ท่าน</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <Wifi className="w-5 h-5 text-[#B8860B]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">อินเทอร์เน็ต</p>
                        <p className="text-sm font-medium text-slate-700">ความเร็วสูง</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Amenities */}
                  <div className="mb-12">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">สิ่งอำนวยความสะดวก</p>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                      {viewingRoom.amenities.map(amenity => {
                        let Icon = Check;
                        if (amenity.includes('Wifi')) Icon = Wifi;
                        if (amenity.includes('TV')) Icon = Tv;
                        if (amenity.includes('อาหารเช้า')) Icon = Utensils;
                        if (amenity.includes('อ่างอาบน้ำ')) Icon = Bath;
                        if (amenity.includes('เครื่องปรับอากาศ')) Icon = Snowflake;
                        if (amenity.includes('กาแฟ')) Icon = Coffee;
                        
                        return (
                          <div key={amenity} className="flex items-center gap-3 text-sm text-slate-600 font-light">
                            <Icon className="w-4 h-4 text-[#B8860B]" />
                            {amenity}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6 pt-10 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ราคาต่อคืน</p>
                      <p className="text-3xl font-sans font-semibold text-[#064E3B]">฿{viewingRoom.price.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedRoom(viewingRoom);
                        setViewingRoom(null);
                        document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-10 py-4 bg-[#064E3B] text-white rounded-2xl font-bold hover:bg-[#053F30] transition-all shadow-lg hover:shadow-xl"
                    >
                      จองตอนนี้
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
