import { useRef, useState } from "react";
import { Box, Button, Image, SimpleGrid } from "@chakra-ui/react";
import { apiUploadPortfolio } from "@/api";
import { useToast } from '@chakra-ui/toast';

const PortfolioUpload = () => {
  const inputRef = useRef(null);
  const toast = useToast();
  const [files, setFiles] = useState([]);

  const handleSelect = e => setFiles([...e.target.files]);
  const handleUpload = async () => {
    const fd = new FormData();
    files.forEach(f => fd.append("files", f));
    await apiUploadPortfolio(fd);
    toast({ status: "success", description: "Uploaded!" });
    setFiles([]);
  };

  return (
    <Box>
      <input
        type="file"
        ref={inputRef}
        hidden
        multiple
        accept="image/*,video/*"
        onChange={handleSelect}
      />
      <Button onClick={() => inputRef.current.click()}>Select Files</Button>
      {files.length > 0 && (
        <Button ml={3} colorScheme="teal" onClick={handleUpload}>
          Upload ({files.length})
        </Button>
      )}

      <SimpleGrid columns={[2, null, 3]} spacing={4} mt={4}>
        {files.map(f => (
          <Image
            key={f.name}
            src={URL.createObjectURL(f)}
            h="100px"
            objectFit="cover"
            borderRadius="md"
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default PortfolioUpload;
