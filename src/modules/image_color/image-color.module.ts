import { Module } from "@nestjs/common";
import { ImageColorService } from "./image-color.service";

@Module({
  providers: [
    ImageColorService
  ],
  exports: [
    ImageColorService,
  ],
})
export class ImageColorModule {}