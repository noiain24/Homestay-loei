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
  Coffee, 
  Wind, 
  Waves,
  Loader2,
  X,
  Search,
  Trash2,
  AlertCircle
} from 'lucide-react';

const N8N_WEBHOOK_URL = "/api/booking";
const ROOM_STATUS_WEBHOOK_URL = "/api/gas-room-status";

// Fixed Spreadsheet ID
const SHEET_ID = "18enn4tE_3yCxfYha-qha6_S7ifzZ2ulRX8bnPhQrweQ";

// Theme Colors
const COLORS = {
  leafGreen: "#2D5A27",
  woodBrown: "#B8860B",
  cloudWhite: "#F8F9FA",
  mistyGray: "#E5E7EB",
};

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
  const [error, setError] = useState<string | null>(null);
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
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

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

          // Handle Capacity and Amenities
          const rawCapacity = getValue(row, 'Capacity', 'capacity').toString();
          const hasAmenitiesInCapacity = rawCapacity.includes(',') || rawCapacity.includes('แอร์') || rawCapacity.includes('Wifi');
          
          const rawAmenities = getValue(row, 'Amenities', 'amenities');
          const sheetAmenities = rawAmenities 
            ? rawAmenities.toString().split(',').map((s: string) => s.trim()) 
            : (hasAmenitiesInCapacity ? rawCapacity.split(',').map((s: string) => s.trim()) : []);

          return {
            id: roomId.toString(),
            name: getValue(row, 'Room_Name', 'name', 'Room Name') || "Unnamed Room",
            description: getValue(row, 'Description', 'description') || "",
            fullDescription: getValue(row, 'Full_Description', 'Full Description') || getValue(row, 'Description', 'description') || "",
            price: cleanPrice,
            image: mainImage,
            images: allImages.length > 0 ? allImages : [mainImage],
            amenities: sheetAmenities,
            capacity: hasAmenitiesInCapacity ? "" : rawCapacity
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
      console.log(`Fetching room status from GAS via proxy: ${ROOM_STATUS_WEBHOOK_URL}`);
      const response = await fetch(ROOM_STATUS_WEBHOOK_URL);
      if (!response.ok) {
        console.warn(`GAS room status fetch failed with status: ${response.status}`);
        return;
      }
      
      const text = await response.text();
      if (!text || text.trim() === "") {
        console.warn("GAS room status returned an empty response");
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Expected JSON from GAS but received:", text.substring(0, 100));
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

        console.log('Active Bookings from GAS:', activeBookings.length);
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
      console.error('Error in updateRoomButtons:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRoom || !customerName || !phone || !email || !checkIn || !checkOut || !slipFile) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วนและอัปโหลดสลิปการโอนเงิน");
      return;
    }

    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }

    // Simple phone validation (Thai format)
    if (!/^[0-9]{9,10}$/.test(phone)) {
      setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9-10 หลัก)");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('bookingId', `BK-${Math.floor(100000 + Math.random() * 900000)}`);
    formData.append('lineId', urlUserId); // For Column M: UserID LINE
    formData.append('facebookId', facebookId); // For Column N: facebookId
    formData.append('customerName', customerName);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('socialId', socialId);
    formData.append('roomName', selectedRoom.name);
    formData.append('checkIn', format(checkIn, 'yyyy-MM-dd'));
    formData.append('checkOut', format(checkOut, 'yyyy-MM-dd'));
    formData.append('totalPrice', calculateTotalPrice().toString());
    
    // Append the file directly
    if (slipFile) {
      formData.append('slip', slipFile, 'slip.jpg');
    }

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        // Important: Do not set Content-Type header for FormData
        body: formData,
      });

      if (response.ok) {
        setIsSuccess(true);
        // Reset form after success
        setTimeout(() => {
          setIsSuccess(false);
          setSelectedRoom(null);
          setCustomerName('');
          setPhone('');
          setEmail('');
          setSocialId('');
          setCheckIn(null);
          setCheckOut(null);
          setSlipFile(null);
          setSlipPreview(null);
        }, 5000);
      } else {
        const errorText = await response.text();
        let errorMessage = "เกิดข้อผิดพลาดในการส่งข้อมูล";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.details || errorMessage;
        } catch (e) {
          errorMessage = errorText.substring(0, 100) || errorMessage;
        }
        
        // Specific check for n8n POST error
        if (errorMessage.includes("not registered for POST requests")) {
          errorMessage = "⚠️ ตั้งค่า n8n ไม่ถูกต้อง: กรุณาเปลี่ยน HTTP Method ในโหนด Webhook ของ n8n จาก GET เป็น POST และกด Activate เวิร์กโฟลว์";
        }
        
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "ไม่สามารถส่งข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      const response = await fetch("/api/checkphone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: searchPhone }),
      });

      if (response.ok) {
        const data = await response.json();
        // Expected JSON: { customerName, roomName, row_number, checkIn, checkOut, status }
        if (data && data.customerName) {
          setSearchResult({
            customerName: data.customerName,
            roomName: data.roomName,
            rowNumber: data.row_number,
            checkIn: data.checkIn,
            checkOut: data.checkOut
          });
        } else {
          setSearchError("ไม่พบข้อมูลการจองสำหรับเบอร์โทรศัพท์นี้");
        }
      } else {
        setSearchError("เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchError("ไม่สามารถเชื่อมต่อกับระบบได้");
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

  const handleCancelBooking = async () => {
    if (!searchResult) return;
    
    setIsCancelling(true);
    try {
      const response = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          row: searchResult.rowNumber, 
          action: "ยกเลิก" 
        }),
      });

      if (response.ok) {
        setCancelMessage("ส่งเรื่องยกเลิกเรียบร้อย ระบบจะแจ้งเตือนคุณผ่านแชทใน 1 นาที");
        setSearchResult(null);
        setSearchPhone('');
      } else {
        setSearchError("เกิดข้อผิดพลาดในการยกเลิก กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      setSearchError("ไม่สามารถเชื่อมต่อกับระบบได้");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans selection:bg-[#B8860B]/30">
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
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2D5A27] rounded-lg flex items-center justify-center">
                <Wind className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#2D5A27]">
                Loei Misty Homestay
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative h-[40vh] sm:h-[50vh] flex items-center justify-center bg-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative text-center px-4 max-w-3xl"
          >
            <h1 className="text-4xl sm:text-6xl font-bold text-[#2D5A27] mb-4">
              Loei Misty Homestay <br />
              <span className="text-[#B8860B]">ท่ามกลางสายหมอก</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
              สัมผัสวิถีชีวิตที่เรียบง่ายและความงามของธรรมชาติในจังหวัดเลย 
              ที่ไฮตาก เราพร้อมดูแลคุณ
            </p>
            <button 
              onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 bg-[#2D5A27] text-white px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform shadow-lg"
            >
              จองห้องพักเลย <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </section>

        {/* Room Selection */}
        <section id="rooms" className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-[#B8860B] font-bold tracking-widest uppercase text-sm"
            >
              Our Accommodations
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-bold text-[#2D5A27] mt-2"
            >
              เลือกห้องพักที่คุณต้องการ
            </motion.h2>
          </div>

          {isRoomsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#2D5A27] animate-spin mb-4" />
              <p className="text-slate-500">กำลังโหลดข้อมูลห้องพัก...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {rooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 ${selectedRoom?.id === room.id ? 'ring-2 ring-[#B8860B]' : ''}`}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={getDirectLink(room.image)} 
                      alt={room.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-[#2D5A27]">
                      ฿{room.price.toLocaleString()} / คืน
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-800">{room.name}</h3>
                      {room.capacity && (
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                          พักได้ {room.capacity}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{room.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {room.amenities.slice(0, 3).map(amenity => (
                        <span key={amenity} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-100">
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-100">
                          +{room.amenities.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={() => {
                          setViewingRoom(room);
                          setActiveImageIndex(0);
                        }}
                        className="w-full py-2 rounded-xl font-semibold text-[#B8860B] border border-[#B8860B] hover:bg-[#B8860B] hover:text-white transition-all"
                      >
                        ดูรายละเอียด
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedRoom(room);
                          document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        data-room={room.name}
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${
                          selectedRoom?.id === room.id 
                            ? 'bg-[#2D5A27] text-white' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {selectedRoom?.id === room.id ? 'เลือกแล้ว' : 'เลือกห้องนี้ (ว่าง)'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Booking Form Section */}
        <section id="booking-form" className="bg-[#2D5A27] py-24 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#B8860B]/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-800">ข้อมูลการจอง</h2>
                <p className="text-slate-500 mt-2">กรุณากรอกข้อมูลเพื่อยืนยันการเข้าพัก</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Room Summary if selected */}
                {selectedRoom && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#F8F9FA] p-4 rounded-2xl border border-slate-100 flex items-center gap-4"
                  >
                    <img src={getDirectLink(selectedRoom.image)} className="w-20 h-20 rounded-xl object-cover" alt="" />
                    <div>
                      <p className="text-xs font-bold text-[#B8860B] uppercase tracking-wider">ห้องที่เลือก</p>
                      <h4 className="font-bold text-slate-800">{selectedRoom.name}</h4>
                      <p className="text-sm text-slate-500">฿{selectedRoom.price.toLocaleString()} / คืน</p>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#B8860B]" /> ชื่อ-นามสกุล
                    </label>
                    <input 
                      type="text" 
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="เช่น สมชาย ใจดี"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#B8860B]" /> เบอร์โทรศัพท์
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812345678"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#B8860B]" /> อีเมล (สำหรับรับยืนยันการจอง)
                    </label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Check-in */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#B8860B]" /> วันที่เช็คอิน
                    </label>
                    <DatePicker
                      selected={checkIn}
                      onChange={(date) => setCheckIn(date)}
                      selectsStart
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={today}
                      excludeDates={selectedRoom ? bookedDates[selectedRoom.name.trim()] || [] : []}
                      dayClassName={(date) => {
                        if (!selectedRoom) return "";
                        const isBooked = (bookedDates[selectedRoom.name.trim()] || []).some(d => isSameDay(d, date));
                        return isBooked ? "react-datepicker__day--booked" : "";
                      }}
                      placeholderText="เลือกวันที่เช็คอิน"
                      className="datepicker-input"
                      dateFormat="dd/MM/yyyy"
                      locale={th}
                      required
                    />
                  </div>

                  {/* Check-out */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#B8860B]" /> วันที่เช็คเอาท์
                    </label>
                    <DatePicker
                      selected={checkOut}
                      onChange={(date) => setCheckOut(date)}
                      selectsEnd
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={checkIn || today}
                      excludeDates={selectedRoom ? bookedDates[selectedRoom.name.trim()] || [] : []}
                      dayClassName={(date) => {
                        if (!selectedRoom) return "";
                        const isBooked = (bookedDates[selectedRoom.name.trim()] || []).some(d => isSameDay(d, date));
                        return isBooked ? "react-datepicker__day--booked" : "";
                      }}
                      placeholderText="เลือกวันที่เช็คเอาท์"
                      className="datepicker-input"
                      dateFormat="dd/MM/yyyy"
                      locale={th}
                      required
                    />
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-[#F8F9FA] p-8 rounded-3xl border border-dashed border-slate-300">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="text-center sm:text-left flex-1">
                      <h3 className="text-xl font-bold text-[#2D5A27] mb-2">ชำระเงินผ่านการโอน</h3>
                      <p className="text-slate-600 text-sm mb-4">
                        ธนาคารกสิกรไทย (K-Bank)<br />
                        เลขบัญชี: <span className="font-bold text-slate-800">123-4-56789-0</span><br />
                        ชื่อบัญชี: <span className="font-bold text-slate-800">บจก. เลย มิสตี้ โฮมสเตย์</span>
                      </p>
                      <div className="bg-white p-2 inline-block rounded-xl shadow-sm border border-slate-100">
                        <img 
                          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LoeiMistyHomestay" 
                          alt="QR Code Payment" 
                          className="w-32 h-32"
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-64">
                      <label className="block text-sm font-bold text-slate-700 mb-2">อัปโหลดสลิปยืนยัน</label>
                      <div className="relative group">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${slipPreview ? 'border-[#2D5A27] bg-[#2D5A27]/5' : 'border-slate-300 group-hover:border-[#B8860B] bg-slate-50'}`}>
                          {slipPreview ? (
                            <img src={slipPreview} className="h-full w-full object-contain p-2" alt="Slip Preview" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-[#B8860B] transition-colors" />
                              <span className="text-xs text-slate-500">คลิกเพื่ออัปโหลด</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Price & Submit */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-100">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-slate-500">ราคาสุทธิ</p>
                    <p className="text-3xl font-bold text-[#2D5A27]">฿{calculateTotalPrice().toLocaleString()}</p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting || isOverlap}
                    className={`w-full sm:w-auto px-12 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${
                      isOverlap 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-[#B8860B] text-white hover:bg-[#966D09] hover:shadow-xl'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> กำลังส่งข้อมูล...
                      </>
                    ) : isOverlap ? (
                      'เต็มแล้วในวันที่คุณเลือก'
                    ) : (
                      'ยืนยันการจองห้องพัก'
                    )}
                  </button>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> {error}
                  </motion.div>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* Manage Booking Section */}
        <section id="manage-booking" className="bg-slate-50 py-24">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden p-8 sm:p-12 border border-slate-100">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-800">จัดการการจอง</h2>
                <p className="text-slate-500 mt-2">ค้นหาประวัติการจองหรือขอยกเลิกการเข้าพัก</p>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="tel" 
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    placeholder="กรอกเบอร์โทรศัพท์ที่ใช้จอง"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <button 
                  onClick={handleSearchBooking}
                  disabled={isSearching}
                  className="w-full py-4 bg-[#2D5A27] text-white rounded-2xl font-bold shadow-lg hover:bg-[#1e3d1a] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  ค้นหาการจอง
                </button>

                {searchError && (
                  <motion.p 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="text-center text-red-500 text-sm font-medium"
                  >
                    {searchError}
                  </motion.p>
                )}

                {cancelMessage && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="p-6 bg-green-50 border border-green-100 rounded-3xl text-center"
                  >
                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <p className="text-green-700 font-medium">{cancelMessage}</p>
                  </motion.div>
                )}

                <AnimatePresence>
                  {searchResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-[#F8F9FA] p-6 rounded-3xl border border-slate-100 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-[#B8860B] uppercase tracking-wider mb-1">พบข้อมูลการจอง</p>
                          <h4 className="text-xl font-bold text-slate-800">{searchResult.customerName}</h4>
                          <p className="text-slate-500">ห้องพัก: {searchResult.roomName}</p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            <p className="text-slate-600">
                              <span className="font-semibold text-[#2D5A27]">เช็คอิน:</span> {formatSheetDate(searchResult.checkIn)}
                            </p>
                            <p className="text-slate-600">
                              <span className="font-semibold text-[#2D5A27]">เช็คเอาท์:</span> {formatSheetDate(searchResult.checkOut)}
                            </p>
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-xl shadow-sm">
                          <User className="w-6 h-6 text-[#2D5A27]" />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <button 
                          onClick={handleCancelBooking}
                          disabled={isCancelling}
                          className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                          {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          ขอยกเลิกการจองนี้
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-[#2D5A27] rounded flex items-center justify-center">
              <Wind className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-[#2D5A27]">Loei Homestay</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 เลย โฮมสเตย์ - สัมผัสความอบอุ่นท่ามกลางสายหมอก<br />
             ไฮตาก
          </p>
        </div>
      </footer>

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 sm:p-12 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">จองห้องพักสำเร็จ!</h2>
              <p className="text-slate-500 mb-8">
                เราได้รับข้อมูลการจองและหลักฐานการโอนเงินของคุณแล้ว 
                เจ้าหน้าที่จะตรวจสอบและติดต่อกลับโดยเร็วที่สุด
              </p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="w-full py-4 bg-[#2D5A27] text-white rounded-xl font-bold hover:bg-[#1e3d1a] transition-colors"
              >
                ตกลง
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Detail Modal */}
      <AnimatePresence>
        {viewingRoom && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h2 className="text-2xl font-bold text-[#2D5A27]">{viewingRoom.name}</h2>
                <button 
                  onClick={() => setViewingRoom(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                {/* Image Gallery */}
                <div className="relative h-64 sm:h-96 bg-slate-100">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImageIndex}
                      src={getDirectLink(viewingRoom.images[activeImageIndex])}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>
                  
                  {/* Gallery Navigation */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-md p-2 rounded-full">
                    {viewingRoom.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${activeImageIndex === idx ? 'bg-white w-6' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">รายละเอียดห้องพัก</h3>
                      {viewingRoom.capacity && (
                        <div className="mb-4 flex items-center gap-2 text-[#B8860B] font-semibold">
                          <User className="w-5 h-5" />
                          <span>จำนวนผู้เข้าพัก: {viewingRoom.capacity}</span>
                        </div>
                      )}
                      <p className="text-slate-600 leading-relaxed mb-6">
                        {viewingRoom.fullDescription}
                      </p>
                      
                      <h3 className="text-lg font-bold text-slate-800 mb-4">สิ่งอำนวยความสะดวก</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {viewingRoom.amenities.map(amenity => (
                          <div key={amenity} className="flex items-center gap-2 text-slate-600 text-sm">
                            <div className="w-2 h-2 bg-[#B8860B] rounded-full" />
                            {amenity}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="md:w-72">
                      <div className="bg-[#F8F9FA] p-6 rounded-3xl border border-slate-100 sticky top-4">
                        <p className="text-sm text-slate-500 mb-1">ราคาเริ่มต้น</p>
                        <p className="text-3xl font-bold text-[#2D5A27] mb-6">฿{viewingRoom.price.toLocaleString()} <span className="text-sm font-normal text-slate-400">/ คืน</span></p>
                        
                        <button 
                          onClick={() => {
                            setSelectedRoom(viewingRoom);
                            setViewingRoom(null);
                            document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          data-room={viewingRoom.name}
                          className="w-full py-4 rounded-2xl font-bold shadow-lg transition-all bg-green-600 text-white hover:bg-green-700"
                        >
                          จองห้องนี้เลย
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
