/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Upload, 
  CheckCircle2, 
  ChevronRight, 
  Wifi, 
  Coffee, 
  Wind, 
  Waves,
  Loader2,
  X
} from 'lucide-react';

const N8N_WEBHOOK_URL = "https://explanate-lyn-crawliest.ngrok-free.dev/webhook-test/booking_log";

// ✅ แก้ไขตรงนี้: ต้องเป็นลิงก์ export?format=csv เท่านั้น
const MASTER_CONFIG_URL = "https://docs.google.com/spreadsheets/d/1bAJtopLJiMlQLXAg1HlK_647VI-7Uiy82yIIwO-3XVc/export?format=csv"; 

const DEFAULT_SHEET_ID = "18enn4tE_3yCxfYha-qha6_S7ifzZ2ulRX8bnPhQrweQ";

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

// ✅ ปรับปรุงการแปลงลิงก์ Google Drive ให้รองรับรูปภาพบนเว็บ 100%
const getDirectLink = (url: string | undefined) => {
  if (!url) return "";
  const driveMatch = url.match(/(?:\/d\/|id=)([\w-]+)/);
  if (driveMatch && driveMatch[1]) {
    // ใช้ Direct Link format ที่รองรับการแสดงผลบนเบราว์เซอร์
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  return url;
};

export default function App() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [currentSheetId, setCurrentSheetId] = useState<string>(DEFAULT_SHEET_ID);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [slipBase64, setSlipBase64] = useState<string | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlUserId, setUrlUserId] = useState<string>('');
  const [urlOwner, setUrlOwner] = useState<string>('');

  // 1. ดึงข้อมูลจาก URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUrlUserId(params.get('userId') || '');
    setUrlOwner(params.get('owner') || '');
  }, []);

  // 2. SaaS Logic: ค้นหา Spreadsheet ID จาก Master ตามชื่อ Owner
  useEffect(() => {
    if (!urlOwner) {
      setCurrentSheetId(DEFAULT_SHEET_ID);
      return;
    }

    Papa.parse(MASTER_CONFIG_URL, {
      download: true,
      header: true,
      complete: (results) => {
        const config = results.data.find((row: any) => 
          row.owner?.toString().trim().toLowerCase() === urlOwner.trim().toLowerCase()
        );
        
        if (config && config.spreadsheet_id) {
          setCurrentSheetId(config.spreadsheet_id.trim());
        } else {
          setCurrentSheetId(DEFAULT_SHEET_ID);
        }
      },
      error: () => setCurrentSheetId(DEFAULT_SHEET_ID)
    });
  }, [urlOwner]);

  // 3. ดึงข้อมูลห้องพักจาก Google Sheets ของเจ้าของคนนั้นๆ
  useEffect(() => {
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${currentSheetId}/export?format=csv`;
    setIsRoomsLoading(true);

    Papa.parse(sheetUrl, {
      download: true,
      header: true,
      complete: (results) => {
        const parsedRooms = results.data.map((row: any) => {
          const rawPrice = row.Price_Per_Night || row.price || "0";
          const cleanPrice = Number(rawPrice.toString().replace(/[^\d]/g, ''));
          const imageUrls = (row.Image_URL || row.image || "").toString().split(',').map((s: string) => s.trim()).filter(Boolean);
          const rawCapacity = (row.Capacity || row.capacity || "").toString();
          
          return {
            id: row.Room_ID || row.id,
            name: row.Room_Name || row.name,
            description: row.Description || row.description,
            fullDescription: row.Full_Description || row.description,
            price: cleanPrice,
            image: imageUrls[0] || "",
            images: imageUrls.length > 0 ? imageUrls : ["https://picsum.photos/800/600"],
            amenities: (row.Amenities || "").toString().split(',').map((s: string) => s.trim()).filter(Boolean),
            capacity: rawCapacity
          };
        }).filter((room: any) => room.id);

        setRooms(parsedRooms);
        setIsRoomsLoading(false);
      }
    });
  }, [currentSheetId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipBase64(reader.result as string);
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedRoom || !checkIn || !checkOut) return 0;
    const diff = Math.ceil(Math.abs(new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff * selectedRoom.price : selectedRoom.price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !customerName || !phone || !checkIn || !checkOut || !slipBase64) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วนและอัปโหลดสลิป");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
          userId: urlUserId,
          owner: urlOwner,
          customerName,
          phone,
          roomName: selectedRoom.name,
          checkIn,
          checkOut,
          totalPrice: calculateTotalPrice(),
          slipBase64
        }),
      });

      if (response.ok) setIsSuccess(true);
      else throw new Error("ส่งข้อมูลไม่สำเร็จ กรุณาเช็ก n8n");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2D5A27] rounded-lg flex items-center justify-center">
              <Wind className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-[#2D5A27] uppercase">
              {urlOwner || "My"} Homestay
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-32 pb-16 text-center px-4">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-6xl font-bold text-[#2D5A27]">
          จองห้องพัก <span className="text-[#B8860B]">ง่ายๆ ในไม่กี่คลิก</span>
        </motion.h1>
        <p className="mt-4 text-slate-500">เลือกเจ้าของร้านที่คุณต้องการจองผ่าน URL สู่ระบบ SaaS ของเรา</p>
      </header>

      {/* Room Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isRoomsLoading ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-[#2D5A27]" /></div>
        ) : (
          rooms.map(room => (
            <div key={room.id} className={`bg-white rounded-3xl overflow-hidden shadow-lg border-2 transition-all ${selectedRoom?.id === room.id ? 'border-[#B8860B]' : 'border-transparent'}`}>
              <img src={getDirectLink(room.image)} className="w-full h-56 object-cover" alt={room.name} />
              <div className="p-6">
                <h3 className="text-xl font-bold">{room.name}</h3>
                <p className="text-[#2D5A27] font-bold text-lg mt-2">฿{room.price.toLocaleString()} / คืน</p>
                <div className="mt-4 flex gap-2">
                   <button onClick={() => setViewingRoom(room)} className="flex-1 py-2 rounded-xl border border-[#B8860B] text-[#B8860B]">รายละเอียด</button>
                   <button onClick={() => { setSelectedRoom(room); document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex-1 py-2 rounded-xl bg-[#2D5A27] text-white">เลือกห้องนี้</button>
                </div>
              </div>
            </div>
          ))
        )}
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
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${
                          selectedRoom?.id === room.id 
                          ? 'bg-[#2D5A27] text-white' 
                          : 'bg-slate-100 text-slate-700 hover:bg-[#2D5A27] hover:text-white'
                        }`}
                      >
                        {selectedRoom?.id === room.id ? 'เลือกแล้ว' : 'เลือกห้องนี้'}
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
                {/* Hidden inputs */}
                <input type="hidden" name="userId" value={urlUserId} />
                <input type="hidden" name="owner" value={urlOwner} />

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

                  {/* Check-in */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#B8860B]" /> วันที่เช็คอิน
                    </label>
                    <input 
                      type="date" 
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Check-out */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#B8860B]" /> วันที่เช็คเอาท์
                    </label>
                    <input 
                      type="date" 
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none transition-all"
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
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-12 py-4 bg-[#B8860B] text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-[#966D09] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> กำลังส่งข้อมูล...
                      </>
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
                          className="w-full py-4 bg-[#B8860B] text-white rounded-2xl font-bold shadow-lg hover:bg-[#966D09] transition-all"
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
