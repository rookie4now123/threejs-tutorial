import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from "react-router";
import OnlineUser from './page/OnlineUser.tsx';
import Texture from './page/Texture.tsx';
import Loadfont from './page/Loadfont.tsx';
import Demo from './page/demo.tsx';
import Haunted from './page/haunted.tsx';
import { Test2 } from './page/test2.tsx';
import { Test3 } from './page/test3.tsx';
import { Scrollbase } from './page/scrollbase.tsx';
import Game from './page/game.tsx';
import { Memorytest } from './page/memorytest.tsx';
import Projection from './page/Projection.tsx';
createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} >
        <Route index element={<Loadfont />} />
        <Route path="Weiredface" element={<OnlineUser />} />
        <Route path="texture" element={<Texture />} />
        <Route path='test3' element={<Test3 />} />
        <Route path="pixel" element={<Demo />} />
        <Route path='haunted' element={<Haunted />} />
        <Route path='galaxy' element={<Test2 />} />
        <Route path='scrollbase' element={<Scrollbase />} />
        <Route path='game' element={<Game />} />
        <Route path='memorytest' element={<Memorytest />} />
        <Route path='projection' element={<Projection />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
