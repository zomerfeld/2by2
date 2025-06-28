import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TodoSidebar } from "@/components/todo-sidebar";
import { PriorityMatrix, PriorityMatrixControls } from "@/components/priority-matrix";

export default function MatrixPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_338_103)">
                  <rect width="31" height="31" fill="#171515"/>
                  <path d="M12 16C13.6569 16 15 17.3431 15 19V24C15 25.6569 13.6569 27 12 27H7C5.34315 27 4 25.6569 4 24V19C4 17.3431 5.34315 16 7 16H12ZM24 16C25.6569 16 27 17.3431 27 19V24C27 25.6569 25.6569 27 24 27H19C17.3431 27 16 25.6569 16 24V19C16 17.3431 17.3431 16 19 16H24ZM12 4C13.6569 4 15 5.34315 15 7V12C15 13.6569 13.6569 15 12 15H7C5.34315 15 4 13.6569 4 12V7C4 5.34315 5.34315 4 7 4H12ZM24 4C25.6569 4 27 5.34315 27 7V12C27 13.6569 25.6569 15 24 15H19C17.3431 15 16 13.6569 16 12V7C16 5.34315 17.3431 4 19 4H24Z" fill="url(#paint0_linear_338_103)"/>
                  <g filter="url(#filter0_n_338_103)">
                    <rect x="-4" y="-3" width="38" height="38" rx="3" fill="url(#paint1_linear_338_103)" fillOpacity="0.4" style={{mixBlendMode:"color-dodge"}}/>
                  </g>
                  <rect x="22" y="2" width="7" height="7" rx="3" fill="url(#paint2_linear_338_103)" style={{mixBlendMode:"color-dodge"}}/>
                </g>
                <defs>
                  <filter id="filter0_n_338_103" x="-4" y="-3" width="38" height="38" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                    <feTurbulence type="fractalNoise" baseFrequency="50 50" stitchTiles="stitch" numOctaves="3" result="noise" seed="4359" />
                    <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
                    <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                      <feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 "/>
                    </feComponentTransfer>
                    <feComposite operator="in" in2="shape" in="coloredNoise1" result="noise1Clipped" />
                    <feFlood floodColor="rgba(0, 0, 0, 0.25)" result="color1Flood" />
                    <feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
                    <feMerge result="effect1_noise_338_103">
                      <feMergeNode in="shape" />
                      <feMergeNode in="color1" />
                    </feMerge>
                  </filter>
                  <linearGradient id="paint0_linear_338_103" x1="22.5" y1="8" x2="6" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5C88A4"/>
                    <stop offset="1" stopColor="#343C5C"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_338_103" x1="36.5333" y1="-1.73333" x2="0.499997" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8C5F60"/>
                    <stop offset="1" stopColor="#222222" stopOpacity="0.5"/>
                  </linearGradient>
                  <linearGradient id="paint2_linear_338_103" x1="29.4667" y1="2.23333" x2="24.3333" y2="6.43333" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F4999C"/>
                    <stop offset="1" stopColor="#8E595B"/>
                  </linearGradient>
                  <clipPath id="clip0_338_103">
                    <rect width="31" height="31" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Priority Matrix</h1>
          </div>
          <PriorityMatrixControls />
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <TodoSidebar />
          <PriorityMatrix />
        </div>
      </div>
    </DndProvider>
  );
}
