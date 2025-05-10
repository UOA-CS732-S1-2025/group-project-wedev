// src/utils/toast.js
import { createStandaloneToast } from "@chakra-ui/toast";

export const { toast } = createStandaloneToast({
  // 你可以统一自定义默认配置
  defaultOptions: { position: "top", duration: 3000, isClosable: true },
});
