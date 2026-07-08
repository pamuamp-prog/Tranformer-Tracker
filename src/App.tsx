import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  BarChart3, 
  Sparkles, 
  Clock,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InspectionReport } from './types';
import FormView from './components/FormView';
import StatsView from './components/StatsView';

// Local Storage Key
const LOCAL_STORAGE_KEY = 'cute_transformer_inspections_data';
const INSPECTOR_NAME_KEY = 'cute_transformer_inspector_name';

// Realistic Thai Electrical Grid mock reports for immediate rendering
const SEED_DATA: InspectionReport[] = [
  {
    id: 'report-seed-1',
    transformerId: 'TX-4501-A',
    timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    status: 'normal',
    notes: 'ระดับน้ำมันปกติ ไม่มีรอยซึม ตู้ควบคุมภายนอกล็อคแน่นหนาดีมาก ค่ากระแสไฟยังอยู่ในเกณฑ์มาตรฐาน 🟢⚡',
    latitude: 13.7563,
    longitude: 100.5018, // Bangkok
    photo: null,
    photoName: null,
    inspectorName: 'วิศวกรไฟแรง ตรวจดี'
  },
  {
    id: 'report-seed-2',
    transformerId: 'TR-8902-B',
    timestamp: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString(), // 1.5 days ago
    status: 'warning',
    notes: 'มีเสียงฮัมแปลกๆ และเริ่มมีละอองน้ำมันซึมรอบข้อต่อเล็กน้อย ควรรอบันทึกผลตรวจวัดอุณหภูมิซ้ำสัปดาห์หน้า 🟡⚙️',
    latitude: 13.8415,
    longitude: 100.6031, // Ramintra, Bangkok
    photo: null,
    photoName: null,
    inspectorName: 'สมศักดิ์ สายไฟตรง'
  },
  {
    id: 'report-seed-3',
    transformerId: 'TF-2045-N',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    status: 'danger',
    notes: 'ตัวถังร้อนจัดอุณหภูมิเกินพิกัด มีเสียงดังกึกกักบ่อยครั้ง จำเป็นต้องตัดไฟและจัดทีมบำรุงรักษาเข้าซ่อมด่วนที่สุด! 🔴🚒',
    latitude: 18.7883,
    longitude: 98.9853, // Chiang Mai
    photo: null,
    photoName: null,
    inspectorName: 'เดชา ยอดนักตรวจ'
  }
];

export default function App() {
  // Global Application State
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'stats'>('form');
  const [inspectorName, setInspectorName] = useState('สมใจ บริการดี');
  
  // App UI State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Update Clock on header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial data from Local Storage
  useEffect(() => {
    const storedReports = localStorage.getItem(LOCAL_STORAGE_KEY);
    const storedInspector = localStorage.getItem(INSPECTOR_NAME_KEY);
    
    if (storedReports) {
      try {
        setReports(JSON.parse(storedReports));
      } catch (e) {
        console.error('Failed to parse local storage reports:', e);
        setReports(SEED_DATA);
      }
    } else {
      // Pre-populate with beautiful seed data so the client dashboard is instantly exciting
      setReports(SEED_DATA);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_DATA));
    }

    if (storedInspector) {
      setInspectorName(storedInspector);
    }
  }, []);

  // Sync state helpers
  const saveReportsToStorage = (newReports: InspectionReport[]) => {
    setReports(newReports);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newReports));
  };

  const handleUpdateInspectorName = (name: string) => {
    setInspectorName(name);
    localStorage.setItem(INSPECTOR_NAME_KEY, name);
  };

  // Toast notifier trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Report Actions
  const handleAddReport = (reportData: Omit<InspectionReport, 'id'>) => {
    const newReport: InspectionReport = {
      ...reportData,
      id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    };

    const updatedReports = [newReport, ...reports];
    saveReportsToStorage(updatedReports);
    triggerToast('บันทึกข้อมูลรายงานผลเรียบร้อยแล้วค่ะ! ⚡📝');
    
    // Automatically swap to stats view so they can see their newly created report instantly
    setTimeout(() => {
      setActiveTab('stats');
    }, 1500);
  };

  const handleDeleteReport = (id: string) => {
    const updated = reports.filter(r => r.id !== id);
    saveReportsToStorage(updated);
    triggerToast('ลบข้อมูลรายงานเรียบร้อยแล้วค่ะ 🧹');
  };

  const handleSeedDemoData = () => {
    if (confirm('คุณต้องการรีเซ็ตและเติมข้อมูลตัวอย่างของระบบตรวจหม้อแปลงใช่หรือไม่? 🔋')) {
      saveReportsToStorage(SEED_DATA);
      triggerToast('ติดตั้งข้อมูลตัวอย่างเรียบร้อยแล้วค่า ✨');
    }
  };

  const handleClearAllData = () => {
    if (confirm('🚨 คำเตือน: คุณต้องการลบข้อมูลรายงานทั้งหมดในเครื่องเลยใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้ค่ะ')) {
      saveReportsToStorage([]);
      triggerToast('ล้างข้อมูลรายงานในเครื่องทั้งหมดแล้ว 🧹');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans text-gray-800 pb-16 antialiased">
      
      {/* Dynamic Toast Alert Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800"
          >
            <span className="text-amber-400">⚡</span> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern High-Contrast Top Ribbon Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 p-0.5 shadow-sm flex items-center justify-center animate-pulse">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-xl">
                ⚡
              </div>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm md:text-base tracking-tight flex items-center gap-1">
                Transformer Tracker <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-semibold">CUTE ⚡</span>
              </h1>
              <p className="text-[10px] text-gray-400 font-medium">ระบบตรวจเช็คและรายงานผลหม้อแปลงไฟฟ้าหน้างาน</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Local Live Clock */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Clock size={13} className="text-indigo-500 animate-spin-slow" />
              <span className="font-mono">{currentTime || '...'}</span>
            </div>

            {/* Quick action: Demo seed */}
            <button
              onClick={handleSeedDemoData}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-gray-600 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="รีเซ็ตเป็นข้อมูลจำลองเพื่อประเมินความสวยงาม"
            >
              <Sparkles size={11} className="text-amber-500" /> โหลดข้อมูลตัวอย่าง
            </button>
          </div>

        </div>
      </header>

      {/* Dashboard Sub-Container */}
      <main className="max-w-4xl mx-auto px-4 mt-6">
        
        {/* Navigation Tabs with clean sliding highlight */}
        <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-3xs grid grid-cols-2 gap-1.5 mb-8">
          
          {/* Form Tab */}
          <button
            onClick={() => setActiveTab('form')}
            className={`relative py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'form'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 hover:bg-slate-50'
            }`}
          >
            <PlusCircle size={14} />
            <span>กรอกรายงานใหม่ 📝</span>
          </button>

          {/* Stats Tab */}
          <button
            onClick={() => setActiveTab('stats')}
            className={`relative py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 hover:bg-slate-50'
            }`}
          >
            <BarChart3 size={14} />
            <span>สรุปผลสถิติ 📊</span>
          </button>

        </div>

        {/* Animated View Swapper */}
        <div className="min-h-[50vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
            >
              {activeTab === 'form' && (
                <FormView 
                  onAddReport={handleAddReport} 
                  inspectorName={inspectorName} 
                  setInspectorName={handleUpdateInspectorName}
                />
              )}
              {activeTab === 'stats' && (
                <StatsView 
                  reports={reports} 
                  onDeleteReport={handleDeleteReport}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Local Storage System Indicator and Action footer */}
        <div className="mt-16 pt-6 border-t border-gray-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Database size={13} className="text-emerald-500 animate-pulse" />
            <span>ระบบเก็บข้อมูลออฟไลน์ในเครื่องเครื่องนี้อย่างปลอดภัย (Local Storage Mode) 🔌📱</span>
          </div>
          <button
            onClick={handleClearAllData}
            className="text-rose-400 hover:text-rose-600 font-bold transition-colors cursor-pointer"
          >
            🚨 ล้างข้อมูลในเครื่องทั้งหมด
          </button>
        </div>

      </main>
    </div>
  );
}
