import {
  generateUploadDropzone,
  generateUploadButton,
  Uploader,
} from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react/hooks";

import type { OurFileRouterType } from "@/app/api/uploadthing/core";

export const { uploadFiles, useUploadThing } =
  generateReactHelpers<OurFileRouterType>();

export const UploadDropzone = generateUploadDropzone<OurFileRouterType>();
export const uploadButton = generateUploadButton<OurFileRouterType>();
export const UploadThing = Uploader;
