import type { NextPage } from "next";
import { type DragEventHandler, useState, useEffect } from "react";
import Image from "next/image";

import { Link2Icon, Cross2Icon } from "@radix-ui/react-icons";

const DragAndDrop: NextPage<{
  setParentState: (file: File | null) => void;
}> = ({ setParentState }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver: DragEventHandler<HTMLInputElement> = (event) =>
    event.preventDefault();
  const handleDrop: DragEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
      setParentState(file);
    }
  };

  useEffect(() => {
    if (file) {
      setParentState(file);
    } else {
      setParentState(null);
    }
  }, [file, setParentState]);

  return (
    <>
      {!file ? (
        <div
          className="mb-6 flex content-center items-center justify-center p-4"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <label
            htmlFor="img"
            className="flex w-10/12 cursor-pointer content-center items-center justify-center rounded-xl border border-dashed border-neutral-400 bg-neutral-200 p-8 py-14 transition hover:bg-neutral-300 dark:border-neutral-500 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            <div className="flex flex-col content-center justify-center">
              <Link2Icon className="mx-auto h-10 w-10 text-neutral-800 dark:text-neutral-400" />
              <h4 className="mx-auto font-semibold text-neutral-900 dark:text-neutral-300">
                Click to upload a file
              </h4>
              <span className="mx-auto text-sm text-neutral-800 dark:text-neutral-400">
                or drag & drop
              </span>
            </div>
            <input
              type="file"
              id="img"
              name="img"
              accept="image/*, .gif"
              hidden
              onChange={(event) => {
                if (event.target.files && event.target.files[0]) {
                  setFile(event.target.files[0]);
                  setParentState(file);
                }
              }}
            />
          </label>
        </div>
      ) : (
        <div className="mx-auto mb-6 mt-2 flex w-11/12 content-center items-center justify-center dark:text-neutral-400">
          <Image
            src={URL.createObjectURL(file)}
            className="h-auto w-[150px] rounded-lg"
            width={100}
            height={100}
            alt="Uploaded File"
          />
          <p className="ml-4">
            {file.name.slice(0, 4) + "..." + file.name.slice(-5)}
          </p>
          <div
            className="ml-4 h-auto w-auto rounded-full bg-black p-[10px] font-semibold text-red-400 hover:cursor-pointer hover:bg-red-400/30 dark:bg-neutral-700/30"
            onClick={(event) => {
              event.preventDefault();
              setFile(null);
              setParentState(null);
            }}
          >
            <Cross2Icon />
          </div>
        </div>
      )}
    </>
  );
};

export default DragAndDrop;
