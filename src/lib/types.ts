// Extended type definitions for Student Registration & Academic Management System

export type StudentType = 'full_time' | 'part_time' | 'certification' | 'industrial_training'
export type StudentCategory = 'day_scholar' | 'boarder' | 'bridging_course'
export type GenderType = 'male' | 'female' | 'other'
export type RoomType = 'single' | 'double' | 'dorm'
export type FeeType = 'tuition' | 'project' | 'library' | 'boarding' | 'sports' | 'it_lab'
export type PaymentStatus = 'pending' | 'verified' | 'rejected' | 'partial'
export type PaymentMethod = 'online' | 'cash' | 'bank_transfer'
export type TranscriptType = 'semester' | 'yearly' | 'full'

// Extended Student Interface
export interface StudentExtended {
  id: string
  user_id: string
  student_number: string
  program_id: string
  student_type: StudentType
  student_category: StudentCategory
  year_level: number
  enrollment_year: number
  gender: GenderType
  date_of_birth: string
  guardian_name?: string
  guardian_phone?: string
  guardian_email?: string
  address?: string
  national_id?: string
  passport_number?: string
  birth_certificate_url?: string
  photo_url?: string
  biometric_hash?: string
  biometric_enrolled: boolean
  registration_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Fee Structure Interface
export interface FeeStructure {
  id: string
  academic_year_id: string
  program_id: string
  fee_type: FeeType
  amount: number
  is_mandatory: boolean
  description: string
  created_at: string
}

// Student Payment Interface
export interface StudentPayment {
  id: string
  student_id: string
  fee_structure_id: string
  amount_paid: number
  payment_method: PaymentMethod
  receipt_number?: string
  receipt_url?: string
  payment_date: string
  verification_status: PaymentStatus
  verified_by?: string
  verified_date?: string
  manual_entry_flag: boolean
  notes?: string
  created_at: string
  updated_at: string
}

// Room Interface
export interface Room {
  id: string
  room_number: string
  room_type: RoomType
  capacity: number
  current_occupancy: number
  gender_restriction?: GenderType
  floor_number?: number
  building_name?: string
  amenities: string[]
  is_available: boolean
  monthly_fee?: number
  created_at: string
  updated_at: string
}

// Room Allocation Interface
export interface RoomAllocation {
  id: string
  student_id: string
  room_id: string
  allocated_date: string
  vacated_date?: string
  is_active: boolean
  allocation_fee_paid: boolean
  notes?: string
  created_at: string
  updated_at: string
}

// Meal Card Interface
export interface MealCard {
  id: string
  student_id: string
  card_number: string
  balance: number
  is_active: boolean
  issued_date: string
  last_used_date?: string
  created_at: string
  updated_at: string
}

// Student ID Card Interface
export interface StudentIdCard {
  id: string
  student_id: string
  card_number: string
  issue_date: string
  expiry_date?: string
  is_active: boolean
  qr_code_data?: string
  barcode_data?: string
  created_at: string
}

// Biometric Record Interface
export interface BiometricRecord {
  id: string
  student_id: string
  fingerprint_data?: string
  face_scan_data?: string
  enrollment_date: string
  last_updated: string
  quality_score?: number
  created_at: string
}

// Extended Transcript Interface
export interface TranscriptExtended {
  id: string
  student_id: string
  transcript_type: TranscriptType
  academic_year_id?: string
  semester_id?: string
  courses_data: Record<string, any>
  semester_gpa?: number
  cumulative_gpa?: number
  total_credits_attempted: number
  total_credits_earned: number
  academic_standing?: string
  remarks?: string
  generated_by: string
  generated_date: string
  is_official: boolean
  signature_data?: string
  created_at: string
}

// Registration Log Interface
export interface StudentRegistrationLog {
  id: string
  student_id?: string
  action: string
  performed_by: string
  details: Record<string, any>
  timestamp: string
}

// Access Log Interface
export interface AccessLog {
  id: string
  student_id: string
  access_point: string
  access_time: string
  access_granted: boolean
  verification_method: string
  notes?: string
}

// Registration Form Data Interface
export interface RegistrationFormData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: GenderType
  nationality: string
  nationalId: string
  passportNumber: string

  // Guardian Information
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  guardianRelationship: string

  // Academic Information
  programId: string
  studentType: StudentType
  studentCategory: StudentCategory
  previousEducation: string

  // Address Information
  permanentAddress: string
  currentAddress: string
  emergencyContact: string
  emergencyPhone: string

  // Accommodation
  requiresAccommodation: boolean
  roomPreference: RoomType

  // Payment Information
  selectedFees: string[]
  paymentMethod: PaymentMethod
  receiptNumber: string
  receiptFile: File | null

  // Documents
  birthCertificate: File | null
  academicTranscripts: File | null
  passport: File | null
  photo: File | null
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// Dashboard Statistics
export interface StudentDashboardStats {
  totalStudents: number
  pendingRegistrations: number
  pendingPayments: number
  availableRooms: number
  activeStudents: number
  recentRegistrations: StudentExtended[]
}

export interface PaymentSummary {
  totalCollected: number
  totalPending: number
  verifiedPayments: number
  pendingVerification: number
  rejectedPayments: number
}
