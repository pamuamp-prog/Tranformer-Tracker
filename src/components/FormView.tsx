import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  User, 
  Sparkles, 
  Info, 
  Loader2 
} from 'lucide-react';
import { motion } from 'motion/react';
import { InspectionReport, InspectionStatus } from '../types';

interface FormViewProps {
  onAddReport: (report: Omit<InspectionReport, 'id'>) => void;
  inspectorName: string;
  setInspectorName: (name: string) => void;
}

export default function FormView({ onAddReport, inspectorName, setInspectorName }: FormViewProps) {
  // Form State
  const [transformerId, setTransformerId] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [status, setStatus] = useState<InspectionStatus>('normal');
  const [notes, setNotes] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  
  // Photo State
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // UI state
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorFields, setErrorFields] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default timestamp to current local date & time when mounting
  useEffect(() => {
    const now = new Date();
    // Format to local date-time string matching datetime-local input (YYYY-MM-DDTHH:mm)
    const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
    setTimestamp(localISOTime);
  }, [submitSuccess]);

  // Geolocation Handler
  const handleGetLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัดตำแหน่ง 🥺');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMsg = 'ไม่สามารถดึงพิกัดตำแหน่งได้ 📍';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'กรุณาอนุญาตสิทธิ์เข้าถึงพิกัดตำแหน่งในเบราว์เซอร์ 🥺';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'ข้อมูลพิกัดตำแหน่งไม่พร้อมใช้งานในขณะนี้';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'หมดเวลาเชื่อมต่อสัญญาณระบุตำแหน่ง';
        }
        setLocationError(errorMsg);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Image upload and high-performance downscaling canvas compression
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้นนะคิ้วท์! 📸');
      return;
    }

    setIsCompressing(true);
    setPhotoName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for downscaling
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 800; // Maximum dimension to prevent localStorage overflow

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress quality to 0.7 JPEG
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setPhoto(compressedBase64);
        } else {
          setPhoto(event.target?.result as string);
        }
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Quick generator for mock Transformer ID to make it extremely cute and easy
  const generateRandomTransformerId = () => {
    const letters = ['TX', 'TR', 'PM', 'TF'];
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const zones = ['A', 'B', 'C', 'N', 'S', 'E', 'W'];
    const randomZone = zones[Math.floor(Math.random() * zones.length)];
    setTransformerId(`${randomLetter}-${randomCode}-${randomZone}`);
    
    // Clear validation error for this field
    if (errorFields.includes('transformerId')) {
      setErrorFields(errorFields.filter(f => f !== 'transformerId'));
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const missingFields: string[] = [];
    if (!transformerId.trim()) missingFields.push('transformerId');
    if (!inspectorName.trim()) missingFields.push('inspectorName');
    if (!timestamp) missingFields.push('timestamp');

    if (missingFields.length > 0) {
      setErrorFields(missingFields);
      // Scroll to the first error
      const firstError = document.getElementById(missingFields[0]);
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Submit report
    onAddReport({
      transformerId: transformerId.trim().toUpperCase(),
      timestamp: new Date(timestamp).toISOString(),
      status,
      notes: notes.trim(),
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      photo,
      photoName,
      inspectorName: inspectorName.trim()
    });

    // Reset Form
    setTransformerId('');
    setNotes('');
    setLatitude('');
    setLongitude('');
    setPhoto(null);
    setPhotoName(null);
    setErrorFields([]);
    setSubmitSuccess(true);

    // Timeout to clear success screen
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 4000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Cute Banner */}
      <div className="mb-6 bg-gradient-to-r from-amber-100 via-rose-100 to-indigo-100 rounded-3xl p-6 text-center shadow-xs relative overflow-hidden border border-rose-100/50">
        <div className="absolute top-[-10px] right-[-10px] text-5xl opacity-10 select-none">⚡</div>
        <div className="absolute bottom-[-10px] left-[-10px] text-5xl opacity-10 select-none">🔌</div>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center justify-center gap-2">
          <span>📝</span> รายงานการตรวจสอบหม้อแปลง
        </h2>
        <p className="text-xs md:text-sm text-gray-600 mt-1">
          กรอกข้อมูลรายงานผลการตรวจสอบด้วยดีไซน์มินิมอลสุดน่ารักและเก็บข้อมูลปลอดภัย 💛
        </p>
      </div>

      {submitSuccess && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="mb-6 bg-emerald-50 border-2 border-emerald-200 text-emerald-800 rounded-2xl p-5 text-center flex flex-col items-center gap-2 shadow-xs"
        >
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl animate-bounce">
            🎉
          </div>
          <h3 className="font-semibold text-lg text-emerald-900">บันทึกข้อมูลเรียบร้อยแล้วค่า!</h3>
          <p className="text-sm text-emerald-700">รายงานของคุณได้รับการบันทึกเก็บไว้ในระบบเรียบร้อยแล้ว ⚡📱</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
        
        {/* Inspector Name */}
        <div className="space-y-2">
          <label htmlFor="inspectorName" className="font-medium text-gray-700 flex items-center gap-2 text-sm">
            <span className="text-lg">🧑‍✈️</span> ชื่อผู้ตรวจสอบ / ผู้บันทึก <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <User size={18} />
            </div>
            <input
              id="inspectorName"
              type="text"
              placeholder="เช่น นายสุดหล่อ ตรวจไฟดี"
              value={inspectorName}
              onChange={(e) => {
                setInspectorName(e.target.value);
                if (errorFields.includes('inspectorName')) {
                  setErrorFields(errorFields.filter(f => f !== 'inspectorName'));
                }
              }}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50/50 border text-gray-800 transition-all text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-100 ${
                errorFields.includes('inspectorName') 
                  ? 'border-rose-400 focus:border-rose-400' 
                  : 'border-gray-200 focus:border-indigo-400'
              }`}
            />
          </div>
          {errorFields.includes('inspectorName') && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
              <Info size={12} /> กรุณากรอกชื่อผู้บันทึกด้วยนะคะ
            </p>
          )}
        </div>

        {/* Transformer ID and Quick Generate Button */}
        <div className="space-y-2">
          <label htmlFor="transformerId" className="font-medium text-gray-700 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="text-lg">⚡</span> หมายเลขหม้อแปลง <span className="text-rose-500">*</span>
            </span>
            <button
              type="button"
              onClick={generateRandomTransformerId}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-colors"
            >
              <Sparkles size={12} /> สุ่มรหัสทดสอบ
            </button>
          </label>
          <div className="relative">
            <input
              id="transformerId"
              type="text"
              placeholder="เช่น TX-9901-A หรือ TR-2026-X"
              value={transformerId}
              onChange={(e) => {
                setTransformerId(e.target.value);
                if (errorFields.includes('transformerId')) {
                  setErrorFields(errorFields.filter(f => f !== 'transformerId'));
                }
              }}
              className={`w-full px-4 py-3 rounded-2xl bg-gray-50/50 border text-gray-800 font-mono transition-all text-sm uppercase outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-100 ${
                errorFields.includes('transformerId') 
                  ? 'border-rose-400 focus:border-rose-400' 
                  : 'border-gray-200 focus:border-indigo-400'
              }`}
            />
          </div>
          {errorFields.includes('transformerId') && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
              <Info size={12} /> กรุณาระบุหมายเลขหม้อแปลงไฟฟ้าด้วยนะคะ
            </p>
          )}
        </div>

        {/* Date and Time */}
        <div className="space-y-2">
          <label htmlFor="timestamp" className="font-medium text-gray-700 flex items-center gap-2 text-sm">
            <span className="text-lg">📅</span> วันและเวลาในการตรวจสอบ <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <input
                id="timestamp"
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200 text-gray-800 transition-all text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-100`}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const tzOffset = now.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
                setTimestamp(localISOTime);
              }}
              className="px-4 py-3 rounded-2xl text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Clock size={14} /> อัปเดตเป็นเวลาปัจจุบัน
            </button>
          </div>
        </div>

        {/* Inspection Result Status Selection */}
        <div className="space-y-2">
          <label className="font-medium text-gray-700 flex items-center gap-2 text-sm mb-1">
            <span className="text-lg">🔍</span> ผลการตรวจสอบ <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Normal */}
            <button
              type="button"
              onClick={() => setStatus('normal')}
              className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                status === 'normal'
                  ? 'border-emerald-400 bg-emerald-50/70 text-emerald-900 shadow-xs'
                  : 'border-gray-100 bg-gray-50/30 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mt-0.5">🟢</div>
              <div>
                <p className="font-semibold text-sm">ปกติเรียบร้อย</p>
                <p className="text-[11px] text-gray-500 mt-0.5">หม้อแปลงทำงานดี ไม่มีอาการผิดปกติ</p>
              </div>
            </button>

            {/* Warning */}
            <button
              type="button"
              onClick={() => setStatus('warning')}
              className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                status === 'warning'
                  ? 'border-amber-400 bg-amber-50/70 text-amber-900 shadow-xs'
                  : 'border-gray-100 bg-gray-50/30 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mt-0.5">🟡</div>
              <div>
                <p className="font-semibold text-sm">เฝ้าระวัง / ผิดปกติ</p>
                <p className="text-[11px] text-gray-500 mt-0.5">พบอาการแปลกๆ ควรตรวจสอบซ้ำเร็วๆ นี้</p>
              </div>
            </button>

            {/* Danger */}
            <button
              type="button"
              onClick={() => setStatus('danger')}
              className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                status === 'danger'
                  ? 'border-rose-400 bg-rose-50/70 text-rose-900 shadow-xs'
                  : 'border-gray-100 bg-gray-50/30 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mt-0.5">🔴</div>
              <div>
                <p className="font-semibold text-sm">อันตราย / ชำรุดด่วน</p>
                <p className="text-[11px] text-gray-500 mt-0.5">ชำรุดเสียหาย ต้องส่งช่างซ่อมทันที!</p>
              </div>
            </button>

          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label htmlFor="notes" className="font-medium text-gray-700 flex items-center gap-2 text-sm">
            <span className="text-lg">📝</span> รายละเอียดการตรวจสอบเพิ่มเติม
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="ตัวอย่าง: ได้ยินเสียงฮัมดังขึ้นเล็กน้อย, ตัวถังเริ่มมีฝุ่นเกาะ, มีน้ำมันซึมบริเวณวาล์ว..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200 text-gray-800 transition-all text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Coordinates / Geolocation */}
        <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-medium text-slate-800 flex items-center gap-2 text-sm">
              <span className="text-lg">📍</span> พิกัดตำแหน่งหน้างาน
            </span>
            <button
              type="button"
              disabled={isGettingLocation}
              onClick={handleGetLocation}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isGettingLocation 
                  ? 'bg-indigo-100 text-indigo-500' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              {isGettingLocation ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> กำลังดึงข้อมูล...
                </>
              ) : (
                <>
                  <MapPin size={13} /> ดึงพิกัดปัจจุบันอัตโนมัติ
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] text-gray-500 font-medium">ละติจูด (Latitude)</span>
              <input
                type="number"
                step="any"
                placeholder="เช่น 13.7563"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-800 transition-all text-xs font-mono outline-hidden focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-gray-500 font-medium">ลองจิจูด (Longitude)</span>
              <input
                type="number"
                step="any"
                placeholder="เช่น 100.5018"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-800 transition-all text-xs font-mono outline-hidden focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {locationError && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 flex items-start gap-1.5 mt-2">
              ⚠️ <span className="flex-1">{locationError}</span>
            </p>
          )}
        </div>

        {/* Photo Attachment */}
        <div className="space-y-2">
          <label className="font-medium text-gray-700 flex items-center gap-2 text-sm">
            <span className="text-lg">📸</span> แนบรูปถ่ายหน้างานจริง
          </label>
          
          {!photo ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? 'border-indigo-400 bg-indigo-50/50'
                  : 'border-gray-200 bg-gray-50/30 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment" // Hint mobile devices to open camera directly
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-xl shadow-xs">
                {isCompressing ? (
                  <Loader2 className="animate-spin text-indigo-500" size={24} />
                ) : (
                  <Camera size={24} />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {isCompressing ? 'กำลังประมวลผลและบีบอัดรูปภาพ...' : 'กดเพื่อถ่ายรูป หรือ อัปโหลดรูปภาพ'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  รองรับการลากไฟล์มาวาง และเปิดกล้องบนมือถือได้โดยตรง 📱
                </p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-slate-50 p-3">
              <div className="relative aspect-video sm:aspect-3/2 w-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-100">
                <img 
                  src={photo} 
                  alt="Transformer preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="ลบรูปภาพ"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="mt-2.5 px-1.5 flex items-center justify-between text-xs text-gray-500">
                <span className="truncate max-w-[80%] font-mono">
                  📂 {photoName || 'photo-attachment.jpg'}
                </span>
                <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                  บีบอัดแล้ว ✨
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="pt-3">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <CheckCircle size={20} /> บันทึกรายงานการตรวจสอบ ⚡📝
          </button>
        </div>

      </form>
    </div>
  );
}
