import { useNavigate, useParams } from 'react-router-dom';
import { useAdminRegion } from '../../context/AdminRegionContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';

interface MenuCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

export default function MainMenuPage() {
  const { region } = useParams<{ region: string }>();
  const { regions } = useAdminRegion();
  const navigate = useNavigate();

  usePageTitle('Admin Menu');

  // Get region name for breadcrumbs
  const currentRegion = regions.find((r) => r.id === region);
  const regionName = currentRegion?.name || region;

  const menuCards: MenuCard[] = [
    {
      id: 'products',
      title: 'Products',
      description: 'Manage products, topics, articles, videos, and training',
      icon: <CubeIcon className="w-8 h-8" />,
      path: `/admin/${region}/products`,
      color: 'blue',
    },
    {
      id: 'incidents',
      title: 'Incidents',
      description: 'Manage group-level incident banners and alerts',
      icon: <ExclamationTriangleIcon className="w-8 h-8" />,
      path: `/admin/${region}/incidents`,
      color: 'red',
    },
    {
      id: 'popups',
      title: 'Pop-ups',
      description: 'Manage group-level promotional and informational pop-ups',
      icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />,
      path: `/admin/${region}/popups`,
      color: 'purple',
    },
    {
      id: 'config',
      title: 'Group Config',
      description: 'Manage group configuration, countries, and quick access cards',
      icon: <Cog6ToothIcon className="w-8 h-8" />,
      path: `/admin/${region}/settings`,
      color: 'gray',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; icon: string; hover: string; border: string }> = {
      blue: {
        bg: 'bg-blue-100',
        icon: 'text-blue-600',
        hover: 'group-hover:bg-blue-200',
        border: 'hover:border-blue-500',
      },
      red: {
        bg: 'bg-red-100',
        icon: 'text-red-600',
        hover: 'group-hover:bg-red-200',
        border: 'hover:border-red-500',
      },
      purple: {
        bg: 'bg-purple-100',
        icon: 'text-purple-600',
        hover: 'group-hover:bg-purple-200',
        border: 'hover:border-purple-500',
      },
      gray: {
        bg: 'bg-gray-100',
        icon: 'text-gray-600',
        hover: 'group-hover:bg-gray-200',
        border: 'hover:border-gray-500',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <AdminLayout
      breadcrumbs={[{ label: regionName || '' }]}
      maxWidth="4xl"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {regionName} Administration
        </h1>
        <p className="text-gray-600">
          Select a section to manage content for this group
        </p>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {menuCards.map((card) => {
          const colors = getColorClasses(card.color);
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.path)}
              className={`group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all text-left border-2 border-transparent ${colors.border}`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`${colors.bg} p-4 rounded-lg mb-4 transition-colors ${colors.hover}`}
                >
                  <div className={colors.icon}>{card.icon}</div>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </AdminLayout>
  );
}
