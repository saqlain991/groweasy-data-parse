"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileSpreadsheet } from "lucide-react";
import { cn } from "../../lib/utils";

export interface GalleryPhoto {
  id: string | number;
  image: string;
}

export interface GalleryFile {
  id: string | number;
  name: string;
  rows?: number;
  savedAt?: string;
}

const defaultPhotos: GalleryPhoto[] = [
  { id: 1, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" },
  { id: 2, image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=800&auto=format&fit=crop" },
  { id: 3, image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop" },
  { id: 4, image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800&auto=format&fit=crop" },
  { id: 5, image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800&auto=format&fit=crop" },
];

export interface InteractiveFolderGalleryProps {
  photos?: GalleryPhoto[];
  files?: GalleryFile[];
  folderName?: string;
  dragHintText?: string;
  className?: string;
}

export function InteractiveFolderGallery({
  photos = defaultPhotos,
  files,
  folderName = "Photography.gallery",
  dragHintText = "Drag any card down to close",
  className,
}: InteractiveFolderGalleryProps) {
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [hoverFolder, setHoverFolder] = useState(false);
  const items = (files?.length ? files.slice(0, 5) : photos.slice(0, 5)).slice(0, 5);

  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#13151c] py-8 sm:py-12", className)}>
      <div className="relative flex min-h-[420px] w-full flex-col items-center justify-center">
        <div className="pointer-events-none relative flex h-[360px] w-full max-w-[560px] justify-center">
          <motion.div
            className="absolute bottom-6 h-56 w-80 drop-shadow-2xl"
            animate={{ opacity: isFolderOpen ? 0 : 1, scale: isFolderOpen ? 0.9 : 1 }}
          >
            <div className="absolute left-0 top-0 h-10 w-32 rounded-t-xl border border-b-0 border-white/10 bg-linear-to-t from-[#1e1e1e] to-[#2a2a2a]" />
            <div className="absolute inset-x-0 bottom-0 top-8 rounded-b-xl rounded-tr-xl border border-white/10 bg-linear-to-b from-[#1e1e1e] to-[#0a0a0a] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]" />
            <div className="pointer-events-none absolute inset-x-2 bottom-2 top-10 rounded-lg bg-black shadow-inner" />
          </motion.div>

          <div className="absolute bottom-10 z-10 flex justify-center">
            {items.map((item, i) => {
              const offset = i - Math.floor(items.length / 2);
              const stackY = hoverFolder ? offset * -10 - 40 : offset * -5;
              const stackX = hoverFolder ? offset * 30 : offset * 3;
              const stackRotate = hoverFolder ? offset * 8 : offset * 3;
              const stackScale = 1 - Math.abs(offset) * 0.03;
              const isFile = "name" in item;

              return (
                <motion.div
                  key={item.id}
                  drag={isFolderOpen}
                  dragSnapToOrigin
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 100 && isFolderOpen) {
                      setIsFolderOpen(false);
                      setHoverFolder(false);
                    }
                  }}
                  className={cn(
                    "absolute bottom-0 h-72 w-56 origin-bottom overflow-hidden rounded-xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.5)]",
                    isFolderOpen ? "pointer-events-auto cursor-grab active:cursor-grabbing" : "pointer-events-none",
                  )}
                  animate={!isFolderOpen ? {
                    y: stackY,
                    x: stackX,
                    rotate: stackRotate,
                    scale: stackScale,
                    zIndex: i + 10,
                  } : {
                    y: -130,
                    x: offset * 120,
                    rotate: 0,
                    scale: 1.05,
                    zIndex: 50,
                  }}
                  whileHover={isFolderOpen ? { scale: 1.1, zIndex: 100 } : {}}
                  whileDrag={isFolderOpen ? { scale: 1.12, rotate: 5, zIndex: 150 } : {}}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                >
                  {isFile ? (
                    <div className="flex h-full flex-col justify-between bg-linear-to-b from-emerald-500 to-slate-950 p-5 text-white">
                      <div className="flex items-center justify-between">
                        <FileSpreadsheet size={28} />
                        <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-black uppercase tracking-widest">CSV</span>
                      </div>
                      <div>
                        <p className="line-clamp-3 text-[20px] font-black leading-tight">{item.name}</p>
                        <p className="mt-3 text-[12px] font-semibold text-white/70">
                          {item.rows ?? 0} rows{item.savedAt ? ` - ${new Date(item.savedAt).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <img src={item.image} alt="Gallery item" className="pointer-events-none h-full w-full object-cover" />
                  )}
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className="pointer-events-auto absolute bottom-0 z-20 h-44 w-[340px] cursor-pointer drop-shadow-[0_-20px_40px_rgba(0,0,0,0.8)]"
            style={{ transformOrigin: "bottom" }}
            animate={{
              opacity: isFolderOpen ? 0 : 1,
              rotateX: hoverFolder ? -25 : 0,
              y: hoverFolder ? 10 : 0,
              pointerEvents: isFolderOpen ? "none" : "auto",
            }}
            onMouseEnter={() => setHoverFolder(true)}
            onMouseLeave={() => setHoverFolder(false)}
            onClick={() => setIsFolderOpen(true)}
          >
            <div className="relative flex h-full w-full items-end justify-center overflow-hidden rounded-2xl border border-white/20 bg-linear-to-b from-[#2a2a2a] to-[#111] pb-8 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)]">
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent" />
              <div className="flex items-center justify-center rounded-lg border border-black/80 bg-black px-5 py-2.5 shadow-inner backdrop-blur-md">
                <span className="text-sm font-medium tracking-wide text-white/90">{folderName}</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ opacity: isFolderOpen ? 1 : 0, y: isFolderOpen ? 0 : 32 }}
          className="pointer-events-none absolute bottom-6 rounded-full border border-black/10 bg-black/5 px-6 py-3 text-sm font-medium uppercase tracking-widest text-black/50 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-white/50"
        >
          {dragHintText}
        </motion.div>
      </div>
    </div>
  );
}

export { InteractiveFolderGallery as Component };

