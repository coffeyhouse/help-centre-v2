/**
 * Icon - Centralized icon component using Heroicons
 *
 * Maps icon names to Heroicons components for consistent icon usage
 * across the application.
 */

import {
  ArrowDownTrayIcon,
  LockClosedIcon,
  StarIcon,
  DocumentTextIcon,
  BuildingLibraryIcon,
  ComputerDesktopIcon,
  CalendarIcon,
  PlayIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  PhoneIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  CloudIcon,
  BanknotesIcon,
  ChartPieIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  EnvelopeIcon,
  HomeIcon,
  CubeIcon,
  BookOpenIcon,
  CameraIcon,
  BriefcaseIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  VideoCameraIcon,
  Square3Stack3DIcon,
  UserCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

interface IconProps {
  name: string;
  className?: string;
}

/**
 * Icon component that renders the appropriate Heroicon based on name
 */
export default function Icon({ name, className = 'w-6 h-6' }: IconProps) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    download: ArrowDownTrayIcon,
    lock: LockClosedIcon,
    star: StarIcon,
    document: DocumentTextIcon,
    bank: BuildingLibraryIcon,
    remote: ComputerDesktopIcon,
    calendar: CalendarIcon,
    play: PlayIcon,
    checklist: CheckCircleIcon,
    community: ChatBubbleLeftRightIcon,
    graduation: AcademicCapIcon,
    phone: PhoneIcon,
    question: QuestionMarkCircleIcon,
    email: EnvelopeIcon,
    chat: ChatBubbleLeftRightIcon,
    // Navigation icons
    home: HomeIcon,
    products: CubeIcon,
    contact: PhoneIcon,
    // Brand/Logo icons
    book: BookOpenIcon,
    // Social media icons
    instagram: CameraIcon,
    facebook: Square3Stack3DIcon,
    linkedin: BriefcaseIcon,
    twitter: ChatBubbleOvalLeftEllipsisIcon,
    youtube: VideoCameraIcon,
    // Product icons
    'icon-a': ChartBarIcon,
    'icon-b': CloudIcon,
    'icon-c': BanknotesIcon,
    'icon-d': ChartPieIcon,
    'icon-e': ClipboardDocumentListIcon,
    'icon-f': CreditCardIcon,
    // User/Auth icons
    user: UserCircleIcon,
    x: XMarkIcon,
    'chevron-down': ChevronDownIcon,
    logout: ArrowRightOnRectangleIcon,
    // Alert/Status icons
    'alert-circle': ExclamationCircleIcon,
    'check-circle': CheckCircleIcon,
  };

  const IconComponent = iconMap[name] || QuestionMarkCircleIcon;

  return <IconComponent className={className} />;
}
