import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Trophy, 
  Wrench,
  ShieldAlert,
  Search,
  Filter,
  MapPin,
  Calendar,
  User,
  Eye,
  Trash2,
  X,
  FileSpreadsheet,
  FileJson,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InspectionReport, InspectionStatus } from '../types';

interface StatsViewProps {
  reports: InspectionReport[];
  onDeleteReport: (id: string) => void;
}

export default function StatsView({ reports, onDeleteReport }: StatsViewProps) {
  // Active Filter state (triggered by clicking metric cards or breakdown bars)
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<InspectionReport | null>(null);

  // Counts
  const total = reports.length;
  const normalCount = reports.filter(r => r.status === 'normal').length;
  const warningCount = reports.filter(r => r.status === 'warning').length;
  const dangerCount = reports.filter(r => r.status === 'danger').length;

  // Percentages
  const getPercentage = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const normalPct = getPercentage(normalCount);
  const warningPct = getPercentage(warningCount);
  const dangerPct = getPercentage(dangerCount);

  // Top Inspectors query
  const inspectorCounts: { [name: string]: number } = {};
  reports.forEach(r => {
    inspectorCounts[r.inspectorName] = (inspectorCounts[r.inspectorName] || 0) + 1;
  });

  const sortedInspectors = Object.entries(inspectorCounts).sort((a, b) => b[1] - a[1]);
  const topInspector = sortedInspectors[0] ? sortedInspectors[0][0] : 'ยังไม่มีผู้บันทึก';
  const topInspectorCount = sortedInspectors[0] ? sortedInspectors[0][1] : 0;

  // Filtered reports for listing below
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = 
        report.transformerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.notes.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = activeStatusFilter === 'all' || report.status === activeStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, activeStatusFilter]);

  // Date Formatter
  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return isoString;
    }
  };

  // CSV Exporter
  const exportToCSV = () => {
    if (reports.length === 0) {
      alert('ไม่มีข้อมูลรายงานสำหรับส่งออกในขณะนี้ 🥺');
      return;
    }

    const headers = [
      'หมายเลขรายงาน (ID)',
      'หมายเลขหม้อแปลง',
      'วันเวลาที่ตรวจสอบ',
      'ผลการตรวจสอบ',
      'ผู้ตรวจสอบ',
      'ละติจูด',
      'ลองจิจูด',
      'รายละเอียดเพิ่มเติม'
    ];

    const rows = reports.map(r => [
      r.id,
      r.transformerId,
      formatDateTime(r.timestamp),
      r.status === 'normal' ? 'ปกติ' : r.status === 'warning' ? 'เฝ้าระวัง' : 'อันตราย/ชำรุดด่วน',
      r.inspectorName,
      r.latitude || '',
      r.longitude || '',
      r.notes.replace(/\n/g, ' ')
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transformer_inspections_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Exporter
  const exportToJSON = () => {
    if (reports.length === 0) {
      alert('ไม่มีข้อมูลรายงานสำหรับส่งออกในขณะนี้ 🥺');
      return;
    }

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(reports, null, 2)
    )}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `transformer_inspections_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Interaction Notice Banner */}
      <div className="bg-indigo-50 border border-indigo-100/70 p-4 rounded-2xl flex items-start gap-3 text-xs text-indigo-800">
        <span className="text-base select-none mt-0.5">💡</span>
        <div className="space-y-1">
          <p className="font-bold">ระบบรายงานแบบโต้ตอบ (Interactive Dashboard)</p>
          <p className="leading-relaxed text-indigo-700/90">
            คุณสามารถ<b>กดคลิกที่กล่องตัวเลขสถิติ</b> หรือ <b>แถบสัดส่วนสถิติ</b> เพื่อทำการกรองดูข้อมูลหม้อแปลงแต่ละสถานะที่ต้องการได้อย่างทันที พร้อมระบบค้นหาและดาวน์โหลดข้อมูลครบครันด้านล่างค่า!
          </p>
        </div>
      </div>

      {/* Overview Metric cards (Clickable & Active Highlights) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Card */}
        <button
          type="button"
          onClick={() => setActiveStatusFilter('all')}
          className={`text-left rounded-3xl border p-5 flex flex-col justify-between transition-all select-none cursor-pointer focus:outline-hidden ${
            activeStatusFilter === 'all'
              ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-100 shadow-sm'
              : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-gray-500 font-bold flex items-center gap-1.5">
              ตรวจสอบแล้ว 📊
              {activeStatusFilter === 'all' && <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded-full">เลือกอยู่</span>}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-gray-800 font-mono">{total}</p>
            <p className="text-[10px] text-gray-400 mt-1">รายงานทั้งหมดในระบบ ⚡</p>
          </div>
        </button>

        {/* Normal Card */}
        <button
          type="button"
          onClick={() => setActiveStatusFilter('normal')}
          className={`text-left rounded-3xl border p-5 flex flex-col justify-between transition-all select-none cursor-pointer focus:outline-hidden ${
            activeStatusFilter === 'normal'
              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-100 shadow-sm'
              : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-gray-500 font-bold flex items-center gap-1.5">
              ปกติเรียบร้อย 🟢
              {activeStatusFilter === 'normal' && <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full">เลือกอยู่</span>}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-emerald-600 font-mono">{normalCount}</p>
            <p className="text-[10px] text-gray-400 mt-1">{normalPct}% ของทั้งหมด</p>
          </div>
        </button>

        {/* Warning Card */}
        <button
          type="button"
          onClick={() => setActiveStatusFilter('warning')}
          className={`text-left rounded-3xl border p-5 flex flex-col justify-between transition-all select-none cursor-pointer focus:outline-hidden ${
            activeStatusFilter === 'warning'
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-100 shadow-sm'
              : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-gray-500 font-bold flex items-center gap-1.5">
              ต้องเฝ้าระวัง 🟡
              {activeStatusFilter === 'warning' && <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">เลือกอยู่</span>}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-amber-500 font-mono">{warningCount}</p>
            <p className="text-[10px] text-gray-400 mt-1">{warningPct}% ของทั้งหมด</p>
          </div>
        </button>

        {/* Danger Card */}
        <button
          type="button"
          onClick={() => setActiveStatusFilter('danger')}
          className={`text-left rounded-3xl border p-5 flex flex-col justify-between transition-all select-none cursor-pointer focus:outline-hidden ${
            activeStatusFilter === 'danger'
              ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-100 shadow-sm'
              : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-gray-500 font-bold flex items-center gap-1.5">
              ชำรุดเสียหาย 🔴
              {activeStatusFilter === 'danger' && <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded-full">เลือกอยู่</span>}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-rose-600 font-mono">{dangerCount}</p>
            <p className="text-[10px] text-gray-400 mt-1">{dangerPct}% ต้องซ่อมแซม!</p>
          </div>
        </button>

      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Status Distribution Bars (Clickable) */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 md:col-span-7 space-y-4 shadow-xs">
          <h3 className="font-semibold text-gray-800 text-xs md:text-sm flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-500 animate-pulse" /> สัดส่วนสถิติผลการตรวจวัด (กดเพื่อกรองข้อมูลได้นะคะ)
          </h3>

          {total === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-gray-400">
              ไม่มีข้อมูลประมวลผล กรุณากรอกข้อมูลรายงานผลก่อนนะคะ ⚡
            </div>
          ) : (
            <div className="space-y-3.5 pt-1">
              
              {/* Normal progress bar */}
              <button
                type="button"
                onClick={() => setActiveStatusFilter('normal')}
                className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex flex-col gap-1.5 border ${
                  activeStatusFilter === 'normal' 
                    ? 'bg-emerald-50/30 border-emerald-300' 
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs w-full">
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    🟢 หม้อแปลงทำงานปกติ
                  </span>
                  <span className="font-semibold text-emerald-600 font-mono">{normalCount} รายการ ({normalPct}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${normalPct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-emerald-400 h-full rounded-full" 
                  />
                </div>
              </button>

              {/* Warning progress bar */}
              <button
                type="button"
                onClick={() => setActiveStatusFilter('warning')}
                className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex flex-col gap-1.5 border ${
                  activeStatusFilter === 'warning' 
                    ? 'bg-amber-50/30 border-amber-300' 
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs w-full">
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    🟡 มีอาการผิดปกติ / ต้องเฝ้าระวัง
                  </span>
                  <span className="font-semibold text-amber-500 font-mono">{warningCount} รายการ ({warningPct}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${warningPct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-amber-400 h-full rounded-full" 
                  />
                </div>
              </button>

              {/* Danger progress bar */}
              <button
                type="button"
                onClick={() => setActiveStatusFilter('danger')}
                className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex flex-col gap-1.5 border ${
                  activeStatusFilter === 'danger' 
                    ? 'bg-rose-50/30 border-rose-300' 
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs w-full">
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    🔴 ชำรุดเสียหาย / ต้องแก้ไขด่วน
                  </span>
                  <span className="font-semibold text-rose-500 font-mono">{dangerCount} รายการ ({dangerPct}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dangerPct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-rose-400 h-full rounded-full" 
                  />
                </div>
              </button>

            </div>
          )}
        </div>

        {/* Top Inspectors Dashboard Badge */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 md:col-span-5 space-y-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 text-xs md:text-sm flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" /> แชมป์ผู้ตรวจสอบขยันขันแข็ง 🏆
            </h3>
            
            {total === 0 ? (
              <div className="h-28 flex items-center justify-center text-xs text-gray-400">
                ยังไม่มีการกรอกบันทึกข้อมูล
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl shrink-0">
                  👑
                </div>
                <div className="truncate">
                  <p className="text-xs text-amber-800 font-bold uppercase tracking-wide">อันดับ #1</p>
                  <p className="text-sm font-bold text-gray-800 truncate mt-0.5">{topInspector}</p>
                  <p className="text-xs text-gray-500 font-medium">บันทึกสะสมทั้งหมด {topInspectorCount} รายงาน</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] text-gray-400 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-3 text-center">
            ระบบอัปเดตข้อมูลสถิติแบบ Real-time ทุกวินาที ⚡✨
          </div>
        </div>

      </div>

      {/* Real-time Recommendations & Status Alerts */}
      <div className="bg-indigo-900 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] text-7xl opacity-10 select-none">🛠️</div>
        
        <h3 className="font-semibold text-base flex items-center gap-2 mb-2">
          <Wrench size={18} className="text-amber-300" /> คำแนะนำการบำรุงรักษาหน้างานเชิงรุก
        </h3>

        {total === 0 ? (
          <p className="text-xs text-indigo-200">
            ยังไม่มีข้อมูลรายงานผลการตรวจสอบหม้อแปลง กรุณากรอกแบบรายงานแรกเพื่อเริ่มวิเคราะห์แผนงานค่ะ 📝
          </p>
        ) : dangerCount > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-amber-200 font-semibold flex items-center gap-1.5 bg-rose-500/30 px-3 py-1 rounded-lg w-fit">
              <ShieldAlert size={14} className="animate-bounce" /> ดำเนินการด่วนที่สุด! (Action Required)
            </p>
            <p className="text-xs text-indigo-100 leading-relaxed">
              ตรวจพบหม้อแปลงไฟฟ้าชำรุดเสียหายด่วนทั้งหมด <span className="font-bold text-amber-300 underline font-mono text-sm">{dangerCount} ตัว</span> กรุณาส่งประเมินทีมช่างและประสานงานเข้าแก้ไขเพื่อป้องกันระบบไฟฟ้าขัดข้องเป็นวงกว้างค่ะ! 🚒⚡
            </p>
          </div>
        ) : warningCount > 0 ? (
          <div className="space-y-1">
            <p className="text-xs text-amber-200 font-semibold">จัดทำแผนเฝ้าระวังพิเศษ (Watchlist Plan)</p>
            <p className="text-xs text-indigo-100 leading-relaxed">
              มีหม้อแปลงที่ผิดปกติหรือควรเฝ้าระวังทั้งหมด <span className="font-bold text-amber-300 font-mono">{warningCount} ตัว</span> แนะนำให้จัดรอบเข้าตรวจสอบซ้ำภายใน 7-14 วันนี้ เพื่อสังเกตอาการผิดปกติเพิ่ม เช่น ความร้อน วาล์วน้ำมัน และเสียงฮัมผิดปกติค่ะ 🔎
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-emerald-300 font-semibold">ระบบปลอดภัย สมบูรณ์แบบ 100% ✨</p>
            <p className="text-xs text-indigo-100 leading-relaxed">
              หม้อแปลงไฟฟ้าทั้งหมดที่ทำการตรวจสอบในรอบนี้มีสถานะปกติเรียบร้อยดีมากค่ะ! ขอชื่นชมทีมงานที่บำรุงรักษาได้อย่างดีเยี่ยม ปฏิบัติภารกิจต่อไปได้เลยค่ะ 🧑‍✈️⚡🔋
            </p>
          </div>
        )}
      </div>

      {/* --- RECONCILED REPORTS LIST AND SEARCH BLOCK --- */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
        
        {/* Header with Download Tools */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm md:text-base flex items-center gap-2">
              <span>📂</span> รายละเอียดข้อมูลรายงานเชิงลึก
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-bold">
                พบ {filteredReports.length} รายการ
              </span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              แสดงข้อมูลรายงานและเอกสารตรวจสอบตามสถานะที่ถูกกดเลือก
            </p>
          </div>

          {/* Quick Export Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="ดาวน์โหลดเป็นไฟล์ CSV (เปิดใน Excel ได้)"
            >
              <FileSpreadsheet size={14} /> ส่งออก CSV 📊
            </button>
            <button
              onClick={exportToJSON}
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="สำรองข้อมูลเป็นไฟล์ JSON"
            >
              <FileJson size={14} /> สำรองข้อมูล JSON 💾
            </button>
          </div>
        </div>

        {/* Searching and Active status filter controls */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Real Search Box */}
            <div className="relative md:col-span-7">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="ค้นหาด้วยรหัสหม้อแปลง, ชื่อผู้บันทึก หรือรายละเอียดเพิ่มเติม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-3 rounded-2xl bg-gray-50/50 border border-gray-200 text-xs transition-all outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-100 text-gray-800"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Quick Status Pill Filters */}
            <div className="md:col-span-5 flex flex-wrap gap-1.5 items-center justify-start md:justify-end">
              <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                <Filter size={11} /> ตัวกรอง:
              </span>
              <button
                onClick={() => setActiveStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeStatusFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                ทั้งหมด ✨
              </button>
              <button
                onClick={() => setActiveStatusFilter('normal')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeStatusFilter === 'normal'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                ปกติ
              </button>
              <button
                onClick={() => setActiveStatusFilter('warning')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeStatusFilter === 'warning'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                เฝ้าระวัง
              </button>
              <button
                onClick={() => setActiveStatusFilter('danger')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeStatusFilter === 'danger'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                ชำรุด
              </button>
            </div>

          </div>

          {/* Filter Status Reset Helper */}
          {activeStatusFilter !== 'all' && (
            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                💡 ขณะนี้ระบบกำลังแสดงเฉพาะข้อมูลหม้อแปลงสถานะ 
                <b className="text-gray-700 underline font-semibold">
                  {activeStatusFilter === 'normal' ? '🟢 ปกติ' : activeStatusFilter === 'warning' ? '🟡 เฝ้าระวัง' : '🔴 ชำรุดเสียหาย'}
                </b>
              </span>
              <button
                type="button"
                onClick={() => setActiveStatusFilter('all')}
                className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
              >
                แสดงทั้งหมด ✨
              </button>
            </div>
          )}

        </div>

        {/* Dynamic Interactive Reports List Output */}
        {filteredReports.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-gray-200">
            <div className="text-4xl select-none">🔍</div>
            <h4 className="font-semibold text-gray-700 text-sm">ไม่พบผลลัพธ์ที่ค้นหา</h4>
            <p className="text-xs text-gray-400 max-w-xs">
              ไม่พบรายงานผลที่ตรงตามเงื่อนไข ลองค้นหาชื่ออื่น หรือกดเลือกสถานะตรวจสอบแบบอื่นๆ ด้านบนดูนะคะ 🧸
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredReports.map((report) => (
              <motion.div
                layoutId={`report-card-stats-${report.id}`}
                key={report.id}
                className="bg-white rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-xs p-4 flex flex-col justify-between space-y-3.5 transition-all group"
              >
                <div className="space-y-2">
                  {/* Status Badge overlay */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-800 text-xs tracking-tight bg-slate-100 px-2.5 py-0.5 rounded-md">
                      ⚡ {report.transformerId}
                    </span>
                    
                    {report.status === 'normal' && (
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        🟢 ปกติเรียบร้อย
                      </span>
                    )}
                    {report.status === 'warning' && (
                      <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        🟡 เฝ้าระวัง
                      </span>
                    )}
                    {report.status === 'danger' && (
                      <span className="bg-rose-50 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md animate-pulse">
                        🔴 ชำรุดเสียหาย
                      </span>
                    )}
                  </div>

                  {/* Notes snippet */}
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {report.notes ? report.notes : 'ไม่มีรายละเอียดบันทึกเพิ่มเติม ✍️'}
                  </p>
                </div>

                {/* Meta block */}
                <div className="space-y-1.5 pt-3 border-t border-slate-50 text-[10px] text-gray-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar size={11} className="text-indigo-400 shrink-0" />
                    <span>{formatDateTime(report.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <User size={11} className="text-rose-400 shrink-0" />
                    <span>โดย: {report.inspectorName}</span>
                  </div>
                  {report.photo && (
                    <div className="flex items-center gap-1 text-xs text-indigo-600 font-semibold bg-indigo-50 w-fit px-2 py-0.5 rounded-full mt-1.5">
                      📸 แนบรูปภาพจริงหน้างาน
                    </div>
                  )}
                </div>

                {/* Sub Action Buttons */}
                <div className="flex items-center gap-2 pt-1.5">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="flex-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 rounded-xl font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye size={12} /> ตรวจดูรายละเอียด
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`คุณต้องการลบข้อมูลผลตรวจสอบของหม้อแปลงหมายเลข ${report.transformerId} หรือไม่? 🥺`)) {
                        onDeleteReport(report.id);
                      }
                    }}
                    className="w-8 h-8 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                    title="ลบรายงาน"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* Details Dialog Modal Pop-up */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl overflow-hidden w-full max-w-xl border border-gray-100 shadow-xl flex flex-col max-h-[90vh]"
            >
              
              {/* Header */}
              <div className="bg-slate-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 font-bold px-2.5 py-1 rounded-full uppercase">
                    ตรวจสอบเอกสารรายงาน
                  </span>
                  <h3 className="font-semibold text-gray-800 text-base mt-1 flex items-center gap-1.5">
                    หม้อแปลง: <span className="font-mono bg-white px-2 py-0.5 border rounded-lg text-sm">{selectedReport.transformerId}</span>
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-8 h-8 rounded-full hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto p-5 space-y-5 flex-1">
                
                {/* Photo rendering inside the dialog */}
                <div className="rounded-2xl overflow-hidden bg-slate-900 border border-gray-100 shadow-xs relative aspect-video">
                  {selectedReport.photo ? (
                    <img
                      src={selectedReport.photo}
                      alt={selectedReport.transformerId}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-slate-100 gap-2">
                      <span className="text-4xl">🔌</span>
                      <p className="text-xs">ไม่มีรูปภาพประกอบการตรวจสอบ</p>
                    </div>
                  )}
                  
                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3">
                    {selectedReport.status === 'normal' && (
                      <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        🟢 สถานะ: ปกติเรียบร้อยดี
                      </span>
                    )}
                    {selectedReport.status === 'warning' && (
                      <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        🟡 สถานะ: เฝ้าระวังพิเศษ
                      </span>
                    )}
                    {selectedReport.status === 'danger' && (
                      <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        🔴 สถานะ: ชำรุดเสียหายด่วน!
                      </span>
                    )}
                  </div>
                </div>

                {/* Information grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">วันเวลาที่กรอกรายงาน</p>
                    <p className="text-xs text-gray-800 font-medium flex items-center gap-1.5">
                      📅 {formatDateTime(selectedReport.timestamp)}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">ผู้ตรวจเช็ค / บันทึกผล</p>
                    <p className="text-xs text-gray-800 font-medium flex items-center gap-1.5">
                      🧑‍✈️ {selectedReport.inspectorName}
                    </p>
                  </div>
                  <div className="space-y-0.5 sm:col-span-2">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">พิกัดตำแหน่ง (Latitude, Longitude)</p>
                    {selectedReport.latitude && selectedReport.longitude ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
                        <span className="text-xs font-mono text-gray-700 font-semibold flex items-center gap-1">
                          📍 {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                        </span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.latitude},${selectedReport.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition-colors"
                        >
                          <ExternalLink size={12} /> นำทางด้วย Google Maps
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">ไม่ได้ระบุพิกัดตำแหน่ง</p>
                    )}
                  </div>
                </div>

                {/* Inspection Notes Details */}
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-gray-800 text-xs flex items-center gap-1">
                    <span>📝</span> รายละเอียดบันทึกผลตรวจสอบ:
                  </h4>
                  <div className="bg-white border border-gray-100 rounded-xl p-3 text-xs text-gray-700 leading-relaxed font-sans whitespace-pre-wrap">
                    {selectedReport.notes ? selectedReport.notes : 'ไม่มีรายละเอียดบันทึกเพิ่มเติม ⚡'}
                  </div>
                </div>

              </div>

              {/* Footer buttons */}
              <div className="bg-slate-50 px-5 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  ปิดหน้าต่างนี้ 🧸
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
