export type InspectionStatus = 'normal' | 'warning' | 'danger';

export interface InspectionReport {
  id: string;
  transformerId: string; // หมายเลขหม้อแปลง
  timestamp: string; // วันและเวลาในการกรอก (ISO String or custom formatted)
  status: InspectionStatus; // ผลการตรวจสอบ
  notes: string; // รายละเอียดเพิ่มเติม
  latitude: number | null; // พิกัดละติจูด
  longitude: number | null; // พิกัดลองจิจูด
  photo: string | null; // Base64 Data URI ของรูปถ่ายหน้างาน
  photoName: string | null; // ชื่อไฟล์รูปภาพ
  inspectorName: string; // ผู้บันทึกข้อมูล
}
