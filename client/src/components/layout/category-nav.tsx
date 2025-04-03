import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CategoryNavProps {
  onSelectGenre: (genre: string) => void;
  selectedGenre: string;
}

const COMMON_GENRES = [
  "All",
  "Romance",
  "Suspense",
  "Comedy",
  "Action",
  "Fantasy",
  "Historical",
  "Medical",
  "Mystery",
  "Thriller",
  "Crime",
  "Reality"
];

export function CategoryNav({ onSelectGenre, selectedGenre }: CategoryNavProps) {
  return (
    <div className="mb-6">
      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <div className="flex space-x-2">
          {COMMON_GENRES.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              className={selectedGenre === genre ? "bg-primary text-primary-foreground" : ""}
              onClick={() => onSelectGenre(genre)}
            >
              {genre}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
