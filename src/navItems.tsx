import { 
  Type, 
  Boxes, 
  Palette,
  FlaskConical, 
  ShieldPlus,
  Activity,
  Orbit, 
  ScrollText, 
  Caravan, 
  Cpu, 
  Projector
} from 'lucide-react';
export const getIcon = (id: string) => {
  switch(id) {
    case 'font': return <Type className="w-5 h-5" />;
    case 'Weiredface': return <Boxes className="w-5 h-5" />;
    case 'texture': return <Palette className="w-5 h-5" />;
    case 'test3': return <FlaskConical className="w-5 h-5" />;
    case 'demo': return <ShieldPlus className="w-5 h-5" />;
    case 'haunted': return <Activity className="w-5 h-5" />;
    case 'galaxy': return <Orbit className="w-5 h-5" />;
    case 'contact': return <ScrollText className="w-5 h-5" />;
    case 'game': return <Caravan className="w-5 h-5" />;
    case 'memorytest': return <Cpu className="w-5 h-5" />;
    case 'projection': return <Projector className="w-5 h-5" />;
    default: return <FlaskConical className="w-5 h-5" />;
  }
};
export const navItems = [
    { id: 'font', title: 'Introduction', path: '/', description: 'Load and display 3D fonts with Three.js' },
    { id: 'projection', title: 'Projection', path: '/projection', description: 'Interactive geometry with React state' },
    { id: 'demo', title: 'Pixelify', path: '/pixel', description: 'Pixelated shader effect with post-processing' },
    { id: 'galaxy', title: 'Galaxy', path: '/galaxy', description: 'Explore the galaxy with Three.js' },
    { id: 'contact', title: 'Storm', path: '/scrollbase', description: 'Scroll-based animations with Three.js' },
    { id: 'Weiredface', title: 'Weiredface', path: 'Weiredface', description: 'A weird face generator using Three.js' },
    { id: 'test3', title: 'Physics', path: '/test3', description: 'Physics simulation with React and Three.js' },
    { id: 'memorytest', title: 'Memorytest', path: 'memorytest', description: 'Memory-efficient rendering techniques' },
  ];