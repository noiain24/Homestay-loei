
export type Language = 'th' | 'en';

export const translations = {
  th: {
    nav: {
      rooms: 'ห้องพัก',
      booking: 'จองห้องพัก',
      manage: 'จัดการการจอง',
      contact: 'ติดต่อเรา',
    },
    hero: {
      subtitle: 'สัมผัสความหรูหราที่เรียบง่าย',
      cta: 'จองห้องพักตอนนี้',
    },
    rooms: {
      title: 'ห้องพักของเรา',
      subtitle: 'เลือกห้องพักที่เหมาะกับคุณ',
      perNight: 'ต่อคืน',
      details: 'ดูรายละเอียด',
      bookNow: 'จองตอนนี้',
      selected: 'เลือกแล้ว',
      capacity: 'จำนวนผู้เข้าพัก',
      amenities: 'สิ่งอำนวยความสะดวก',
      internet: 'อินเทอร์เน็ต',
      highSpeed: 'ความเร็วสูง',
      luxuryRoom: 'ห้องพักสุดหรู',
      viewDetails: 'สัมผัสประสบการณ์การพักผ่อนที่เหนือระดับด้วยห้องพักที่ออกแบบมาอย่างพิถีพิถัน พร้อมสิ่งอำนวยความสะดวกครบครันและวิวทิวทัศน์ที่สวยงาม',
    },
    booking: {
      title: 'จองห้องพัก',
      subtitle: 'เริ่มต้นการพักผ่อนของคุณ',
      description: 'เริ่มต้นการจองห้องพักกับ {name}',
      step1: 'เลือกห้องพัก',
      step2: 'เลือกวันที่',
      step3: 'ข้อมูลผู้ติดต่อ',
      step4: 'ชำระเงิน',
      checkIn: 'วันที่เช็คอิน',
      checkInPlaceholder: 'เลือกวันที่เช็คอิน',
      checkOut: 'วันที่เช็คเอาท์',
      checkOutPlaceholder: 'เลือกวันที่เช็คเอาท์',
      name: 'ชื่อ-นามสกุล',
      fullName: 'ชื่อ-นามสกุล',
      namePlaceholder: 'กรอกชื่อ-นามสกุล',
      phone: 'เบอร์โทรศัพท์',
      email: 'อีเมล',
      selectedRoom: 'ห้องที่เลือก',
      totalPrice: 'ยอดรวมทั้งหมด',
      confirm: 'ยืนยันการจองห้องพัก',
      confirmButton: 'ยืนยันการจอง',
      processing: 'กำลังดำเนินการ...',
      submitting: 'กำลังส่งข้อมูล...',
      unavailable: 'ไม่ว่างในช่วงวันที่เลือก',
      overlapError: 'ห้องไม่ว่างในช่วงที่เลือก',
      paymentTitle: 'ข้อมูลการชำระเงิน',
      paymentDescription: 'กรุณาโอนเงินเพื่อยืนยันการจอง และอัปโหลดสลิปหลักฐานการโอนเงินด้านล่าง',
      bank: 'ธนาคาร',
      bankName: 'ธนาคาร',
      accountNo: 'เลขที่บัญชี',
      accountNumber: 'เลขที่บัญชี',
      accountName: 'ชื่อบัญชี',
      qrAlt: 'QR Code สำหรับชำระเงิน',
      uploadSlip: 'อัปโหลดสลิปโอนเงิน',
      slipPreviewAlt: 'ตัวอย่างสลิปโอนเงิน',
      dragDrop: 'ลากไฟล์มาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์',
      maxSize: 'ขนาดไฟล์สูงสุด 5MB (JPG, PNG)',
      changeFile: 'เปลี่ยนไฟล์',
      validation: {
        room: 'กรุณาเลือกห้องพักที่ต้องการจอง',
        name: 'กรุณากรอกชื่อ-นามสกุลของผู้เข้าพัก',
        phone: 'กรุณากรอกเบอร์โทรศัพท์ติดต่อ',
        phoneLength: 'กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก (ตัวเลขเท่านั้น)',
        email: 'กรุณากรอกอีเมลสำหรับรับข้อมูลการจอง',
        dates: 'กรุณาเลือกวันที่เช็คอินและเช็คเอาท์',
        slip: 'กรุณาอัปโหลดสลิปหลักฐานการโอนเงิน',
      }
    },
    manage: {
      title: 'จัดการการเข้าพักของคุณ',
      subtitle: 'จัดการการจอง',
      description: 'กรอกเบอร์โทรศัพท์ของคุณเพื่อดูหรือยกเลิกการจอง',
      inputPlaceholder: 'กรอกเบอร์โทรศัพท์',
      phonePlaceholder: 'กรอกเบอร์โทรศัพท์ 10 หลัก',
      search: 'ค้นหา',
      found: 'พบข้อมูลการจอง',
      foundBooking: 'พบข้อมูลการจองของคุณ',
      room: 'ห้อง',
      checkIn: 'เช็คอิน',
      checkOut: 'เช็คเอาท์',
      cancel: 'ยกเลิกการเข้าพัก',
      cancelButton: 'ยกเลิกการจองนี้',
      cancelSuccess: 'ส่งเรื่องยกเลิกเรียบร้อย ระบบจะแจ้งเตือนคุณผ่านแชทใน 1 นาที',
      notFound: 'ไม่พบข้อมูลการจองสำหรับเบอร์โทรศัพท์นี้',
      validation: {
        phone: 'กรุณากรอกเบอร์โทรศัพท์',
      }
    },
    errors: {
      server: 'ระบบขัดข้องชั่วคราว กรุณาติดต่อผ่าน LINE',
      webhook: 'ไม่พบเซิร์ฟเวอร์ปลายทาง (n8n) กรุณาตรวจสอบการตั้งค่า Webhook',
      network: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตของคุณ หรือติดต่อผ่าน LINE',
      cors: 'ถูกบล็อกโดยระบบความปลอดภัย (CORS) กรุณาใช้ Shared URL จาก AI Studio',
      cancel: 'ไม่สามารถส่งคำขอยกเลิกได้',
      connection: 'พบปัญหาการเชื่อมต่อ n8n',
      closeNotification: 'ปิดการแจ้งเตือน',
    },
    modals: {
      validationError: {
        title: 'ข้อมูลไม่ครบถ้วน',
        button: 'ตกลง เข้าใจแล้ว',
      },
      error: {
        title: 'เกิดข้อผิดพลาด',
        lineButton: 'ติดต่อผ่าน LINE',
        closeButton: 'ปิด',
      },
      terms: {
        title: 'ข้อกำหนดและเงื่อนไข',
        button: 'ยอมรับและดำเนินการต่อ',
        content: `
          <div class="space-y-6 text-slate-600 font-light leading-relaxed">
            <p>ยินดีต้อนรับสู่ระบบจองที่พัก {name} การใช้งานเว็บไซต์นี้ถือว่าท่านได้ตกลงและยอมรับข้อกำหนดดังต่อไปนี้:</p>
            
            <div class="space-y-4">
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">1. ความถูกต้องของข้อมูลการจอง:</h4>
              <p>ผู้ใช้งานตกลงจะให้ข้อมูลที่เป็นจริงและถูกต้องในการจองที่พักเท่านั้น หากพบว่ามีการใช้ข้อมูลเท็จ หรือการแอบอ้างข้อมูลผู้อื่น เราขอสงวนสิทธิ์ในการยกเลิกรายการจองโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</p>
              
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">2. กระบวนการจองและยืนยัน:</h4>
              <ul class="list-disc pl-6 space-y-2">
                <li>สถานะห้องว่างบนเว็บไซต์เป็นข้อมูลแบบ Real-time อย่างไรก็ตาม การจองจะสมบูรณ์ต่อเมื่อระบบตรวจสอบหลักฐานการชำระเงินเรียบร้อยแล้วเท่านั้น</li>
                <li>การยืนยันการจองจะถูกส่งผ่านระบบ [อีเมล/LINE] ตามที่ท่านได้ให้ข้อมูลไว้</li>
              </ul>
              
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">3. การใช้งานเว็บไซต์อย่างเหมาะสม:</h4>
              <ul class="list-disc pl-6 space-y-2">
                <li>ห้ามมิให้ผู้ใช้งานพยายามแทรกแซง เจาะระบบ หรือกระทำการใดๆ ที่ส่งผลกระทบต่อความเสถียรของเว็บไซต์</li>
                <li>เราไม่อนุญาตให้ใช้โปรแกรมอัตโนมัติ (Bot) ในการดึงข้อมูลหรือสร้างรายการจองในปริมาณมากเกินปกติ</li>
              </ul>
              
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">4. การจำกัดความรับผิดชอบ:</h4>
              <p>แม้เราจะใช้ความพยายามอย่างเต็มที่เพื่อให้ระบบทำงานได้อย่างราบรื่น แต่เราไม่สามารถรับรองความต่อเนื่อง 100% ในกรณีที่เกิดเหตุขัดข้องทางเทคนิคเหนือการควบคุม (เช่น ระบบอินเทอร์เน็ตล่ม หรือการขัดข้องจากผู้ให้บริการคลาวด์) อย่างไรก็ตาม เราจะดำเนินการแก้ไขปัญหาให้เร็วที่สุดเพื่อรักษาผลประโยชน์ของผู้ใช้งาน</p>
              
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">5. การเปลี่ยนแปลงข้อกำหนด:</h4>
              <p>เราขอสงวนสิทธิ์ในการปรับปรุงหรือเปลี่ยนแปลงข้อกำหนดเหล่านี้ได้ทุกเมื่อเพื่อให้สอดคล้องกับมาตรฐานการให้บริการที่ดียิ่งขึ้น</p>
            </div>
          </div>
        `
      },
      privacy: {
        title: 'นโยบายความเป็นส่วนตัว',
        button: 'รับทราบและปิด',
        content: `
          <div class="space-y-6 text-slate-600 font-light leading-relaxed">
            <p><strong>{name}</strong> ("เรา") ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของท่าน เพื่อให้ท่านมั่นใจได้ว่าข้อมูลการจองที่พักของท่านจะถูกจัดการอย่างปลอดภัยตามมาตรฐาน พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)</p>
            
            <div class="space-y-4">
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">ข้อมูลที่เราจัดเก็บ:</h4>
              <ul class="list-disc pl-6 space-y-2">
                <li><strong>ข้อมูลระบุตัวตน:</strong> ชื่อ-นามสกุล, เบอร์โทรศัพท์, LINE ID</li>
                <li><strong>ข้อมูลการทำรายการ:</strong> วันที่เข้าพัก, จำนวนผู้เข้าพัก, รายละเอียดห้องพักที่ท่านเลือก</li>
                <li><strong>หลักฐานการชำระเงิน:</strong> รูปภาพสลิปการโอนเงินเพื่อใช้ยืนยันการจอง</li>
              </ul>
              
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">วัตถุประสงค์ในการเก็บข้อมูล:</h4>
              <ul class="list-disc pl-6 space-y-2">
                <li>เพื่อดำเนินการจองและตรวจสอบสถานะห้องว่างแบบ Real-time ผ่านระบบอัตโนมัติ</li>
                <li>เพื่อใช้ติดต่อสื่อสาร แจ้งสถานะการจอง และประสานงานการเข้าพัก</li>
                <li>เพื่อป้องกันการจองซ้ำซ้อน (Double Booking) และรักษาความถูกต้องของข้อมูล</li>
              </ul>
              
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">การรักษาความปลอดภัยและระยะเวลาจัดเก็บ:</h4>
              <p>ข้อมูลของท่านจะถูกส่งผ่านระบบที่มีการเข้ารหัสปลอดภัย และจัดเก็บไว้ในฐานข้อมูลคลาวด์มาตรฐานระดับสากล (Google Cloud Infrastructure)</p>
              <p>เราจะจัดเก็บข้อมูลไว้เท่าที่จำเป็นสำหรับวัตถุประสงค์ในการให้บริการ และจะลบข้อมูลเมื่อสิ้นสุดระยะเวลาที่กำหนดตามกฎหมาย</p>
              
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">สิทธิของเจ้าของข้อมูล:</h4>
              <p>ท่านมีสิทธิขอเข้าถึง แก้ไข ลบ หรือขอให้ระงับการใช้ข้อมูลส่วนบุคคลของท่าน โดยสามารถติดต่อเจ้าหน้าที่ผ่านช่องทางที่ระบุไว้บนเว็บไซต์นี้</p>
            </div>
          </div>
        `
      }
    },
    footer: {
      contact: 'ติดต่อเรา',
      hours: 'เวลาทำการ',
      checkIn: 'Check-in',
      checkInTime: '14:00 น. เป็นต้นไป',
      checkOut: 'Check-out',
      checkOutTime: 'ก่อน 12:00 น.',
      rights: 'สงวนลิขสิทธิ์.',
      privacy: 'นโยบายความเป็นส่วนตัว',
      terms: 'ข้อกำหนดการให้บริการ',
      acceptTerms: 'ยอมรับเงื่อนไข',
      acknowledge: 'รับทราบ',
      legalInfo: 'ข้อมูลทางกฎหมาย',
      termsTitle: 'ข้อกำหนดและเงื่อนไขการใช้งาน',
    },
    success: {
      title: 'จองห้องพักสำเร็จ!',
      description: 'ขอบคุณที่เลือกพักกับเรา เราได้รับข้อมูลการจองของคุณแล้ว และจะส่งการยืนยันให้คุณโดยเร็วที่สุด',
      close: 'ปิดหน้าต่าง',
    },
    common: {
      loading: 'กำลังโหลด...',
      error: 'เกิดข้อผิดพลาด',
      person: 'ท่าน',
      search: 'ค้นหา',
      selectFile: 'เลือกไฟล์',
      amenities: {
        breakfast: 'อาหารเช้า',
        bathtub: 'อ่างอาบน้ำ',
        airConditioning: 'เครื่องปรับอากาศ',
        coffeeTea: 'กาแฟ/ชา',
        tv: 'ทีวี',
        refrigerator: 'ตู้เย็น',
        hairDryer: 'ไดร์เป่าผม',
        wifi: 'Wifi',
      }
    }
  },
  en: {
    nav: {
      rooms: 'Rooms',
      booking: 'Booking',
      manage: 'Manage Booking',
      contact: 'Contact',
    },
    hero: {
      subtitle: 'Experience Simple Luxury',
      cta: 'Book Now',
    },
    rooms: {
      title: 'Our Rooms',
      subtitle: 'Choose the perfect room for you',
      perNight: 'per night',
      details: 'View Details',
      bookNow: 'Book Now',
      selected: 'Selected',
      capacity: 'Capacity',
      amenities: 'Amenities',
      internet: 'Internet',
      highSpeed: 'High Speed',
      luxuryRoom: 'Luxury Room',
      viewDetails: 'Experience a superior stay with meticulously designed rooms, complete amenities, and stunning views.',
    },
    booking: {
      title: 'Book a Room',
      subtitle: 'Start your vacation',
      description: 'Start your reservation with {name}',
      step1: 'Select Room',
      step2: 'Select Dates',
      step3: 'Contact Info',
      step4: 'Payment',
      checkIn: 'Check-in Date',
      checkInPlaceholder: 'Select check-in date',
      checkOut: 'Check-out Date',
      checkOutPlaceholder: 'Select check-out date',
      name: 'Full Name',
      fullName: 'Full Name',
      namePlaceholder: 'Enter full name',
      phone: 'Phone Number',
      email: 'Email',
      selectedRoom: 'Selected Room',
      totalPrice: 'Total Price',
      confirm: 'Confirm Booking',
      confirmButton: 'Confirm Booking',
      processing: 'Processing...',
      submitting: 'Submitting...',
      unavailable: 'Unavailable for selected dates',
      overlapError: 'Room unavailable for selected dates',
      paymentTitle: 'Payment Information',
      paymentDescription: 'Please transfer the total amount to confirm your booking and upload the slip below.',
      bank: 'Bank',
      bankName: 'Bank',
      accountNo: 'Account No.',
      accountNumber: 'Account Number',
      accountName: 'Account Name',
      qrAlt: 'Payment QR Code',
      uploadSlip: 'Upload Payment Slip',
      slipPreviewAlt: 'Payment slip preview',
      dragDrop: 'Drag & drop file here or click to select',
      maxSize: 'Max size 5MB (JPG, PNG)',
      changeFile: 'Change File',
      validation: {
        room: 'Please select a room to book',
        name: 'Please enter guest full name',
        phone: 'Please enter contact phone number',
        phoneLength: 'Please enter a valid 10-digit phone number',
        email: 'Please enter email for booking info',
        dates: 'Please select check-in and check-out dates',
        slip: 'Please upload payment slip',
      }
    },
    manage: {
      title: 'Manage Your Stay',
      subtitle: 'Manage Booking',
      description: 'Enter your phone number to view or cancel your booking',
      inputPlaceholder: 'Enter phone number',
      phonePlaceholder: 'Enter 10-digit phone number',
      search: 'Search',
      found: 'Booking Found',
      foundBooking: 'Your Booking Found',
      room: 'Room',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      cancel: 'Cancel Booking',
      cancelButton: 'Cancel This Booking',
      cancelSuccess: 'Cancellation request sent. You will be notified via chat in 1 minute.',
      notFound: 'No booking found for this phone number',
      validation: {
        phone: 'Please enter phone number',
      }
    },
    errors: {
      server: 'Server error. Please contact us via LINE',
      webhook: 'Webhook not found (n8n). Please check settings',
      network: 'Cannot connect to server. Please check your internet or contact via LINE',
      cors: 'Blocked by security (CORS). Please use Shared URL from AI Studio',
      cancel: 'Cannot send cancellation request',
      connection: 'n8n Connection Issue',
      closeNotification: 'Close Notification',
    },
    modals: {
      validationError: {
        title: 'Incomplete Information',
        button: 'OK, Got it',
      },
      error: {
        title: 'An Error Occurred',
        lineButton: 'Contact via LINE',
        closeButton: 'Close',
      },
      terms: {
        title: 'Terms of Service',
        button: 'Accept and Continue',
        content: `
          <div class="space-y-6 text-slate-600 font-light leading-relaxed">
            <p>Welcome to {name} booking system. By using this website, you agree to the following terms and conditions:</p>
            
            <div class="space-y-4">
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">1. Accuracy of Booking Information:</h4>
              <p>Users agree to provide true and accurate information for bookings only. If false information or impersonation is found, we reserve the right to cancel the booking without prior notice.</p>
              
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">2. Booking and Confirmation Process:</h4>
              <ul class="list-disc pl-6 space-y-2">
                <li>Room availability on the website is real-time information. However, the booking is only complete once the system has verified the payment proof.</li>
                <li>Booking confirmation will be sent via [Email/LINE] based on the information provided.</li>
              </ul>
              
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">3. Appropriate Website Use:</h4>
              <ul class="list-disc pl-6 space-y-2">
                <li>Users must not attempt to interfere with, hack, or perform any actions that affect the stability of the website.</li>
                <li>We do not allow the use of automated programs (Bots) to retrieve data or create bookings in excessive quantities.</li>
              </ul>
              
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">4. Limitation of Liability:</h4>
              <p>While we make every effort to ensure smooth operation, we cannot guarantee 100% continuity in case of technical failures beyond our control (e.g., internet outages or cloud provider failures). However, we will resolve issues as quickly as possible to protect user interests.</p>
              
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">5. Changes to Terms:</h4>
              <p>We reserve the right to update or change these terms at any time to align with better service standards.</p>
            </div>
          </div>
        `
      },
      privacy: {
        title: 'Privacy Policy',
        button: 'Acknowledge and Close',
        content: `
          <div class="space-y-6 text-slate-600 font-light leading-relaxed">
            <p><strong>{name}</strong> ("we", "us", "our") values the protection of your personal data. We ensure that your booking information is handled securely in accordance with the Personal Data Protection Act (PDPA).</p>
            
            <div class="space-y-4">
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">Data We Collect:</h4>
              <ul class="list-disc pl-6 space-y-2">
                <li><strong>Identity Information:</strong> Full Name, Phone Number, LINE ID</li>
                <li><strong>Transaction Information:</strong> Stay Dates, Number of Guests, Selected Room Details</li>
                <li><strong>Payment Proof:</strong> Images of transfer slips used for booking confirmation</li>
              </ul>
              
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">Purpose of Data Collection:</h4>
              <ul class="list-disc pl-6 space-y-2">
                <li>To process bookings and check real-time room availability through an automated system.</li>
                <li>To communicate, notify booking status, and coordinate your stay.</li>
                <li>To prevent double bookings and maintain data accuracy.</li>
              </ul>
              
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">Security and Retention Period:</h4>
              <p>Your data is transmitted through a secure encrypted system and stored in a world-class standard cloud database (Google Cloud Infrastructure).</p>
              <p>We retain data only as long as necessary for service purposes and will delete it after the period specified by law.</p>
              
              <h4 class="text-lg font-serif font-medium text-[#064E3B]">Data Subject Rights:</h4>
              <p>You have the right to access, correct, delete, or request suspension of the use of your personal data by contacting our staff through the channels provided on this website.</p>
            </div>
          </div>
        `
      }
    },
    footer: {
      contact: 'Contact Us',
      hours: 'Operating Hours',
      checkIn: 'Check-in',
      checkInTime: '14:00 onwards',
      checkOut: 'Check-out',
      checkOutTime: 'Before 12:00',
      rights: 'All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      acceptTerms: 'Accept Terms',
      acknowledge: 'Acknowledge',
      legalInfo: 'Legal Information',
      termsTitle: 'Terms and Conditions',
    },
    success: {
      title: 'Booking Successful!',
      description: 'Thank you for choosing us. We have received your booking and will send confirmation shortly.',
      close: 'Close',
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      person: 'Person(s)',
      search: 'Search',
      selectFile: 'Select File',
      amenities: {
        breakfast: 'Breakfast',
        bathtub: 'Bathtub',
        airConditioning: 'Air Conditioning',
        coffeeTea: 'Coffee/Tea',
        tv: 'TV',
        refrigerator: 'Refrigerator',
        hairDryer: 'Hair Dryer',
        wifi: 'Wifi',
      }
    }
  }
};
