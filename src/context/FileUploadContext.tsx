import React, { createContext, useContext, useState } from "react";

interface FileUpload {
  fieldName: string;
  fileName: string;
  fileUrl: string;
}

interface FileUploadContextType {
  fileUploads: Record<string, FileUpload>;
  addFileUpload: (formId: string, fieldName: string, fileName: string, fileUrl: string) => void;
  removeFileUpload: (formId: string) => void;
  getFileUpload: (formId: string) => FileUpload | undefined;
  clearAllUploads: () => void;
}

const FileUploadContext = createContext<FileUploadContextType | undefined>(undefined);

export function FileUploadProvider({ children }: { children: React.ReactNode }) {
  const [fileUploads, setFileUploads] = useState<Record<string, FileUpload>>({});

  const addFileUpload = (formId: string, fieldName: string, fileName: string, fileUrl: string) => {
    setFileUploads((prev) => ({
      ...prev,
      [formId]: { fieldName, fileName, fileUrl },
    }));
  };

  const removeFileUpload = (formId: string) => {
    setFileUploads((prev) => {
      const newUploads = { ...prev };
      delete newUploads[formId];
      return newUploads;
    });
  };

  const getFileUpload = (formId: string) => {
    return fileUploads[formId];
  };

  const clearAllUploads = () => {
    setFileUploads({});
  };

  return (
    <FileUploadContext.Provider
      value={{
        fileUploads,
        addFileUpload,
        removeFileUpload,
        getFileUpload,
        clearAllUploads,
      }}
    >
      {children}
    </FileUploadContext.Provider>
  );
}

export function useFileUpload() {
  const context = useContext(FileUploadContext);
  if (context === undefined) {
    throw new Error("useFileUpload must be used within a FileUploadProvider");
  }
  return context;
}
