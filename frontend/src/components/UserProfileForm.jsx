// src/components/UserProfileForm.jsx
import { useForm } from "react-hook-form";
import { Input, Button, Stack, FormControl, FormLabel } from "@chakra-ui/react";
import { useUserStore } from "../store/user";

export default function UserProfileForm({ isEditMode }) {
  const { register, handleSubmit, reset } = useForm();
  const { currentUser, updateProfile } = useUserStore();

  // 初始化表单数据
  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone
      });
    }
  }, [currentUser, reset]);

  const onSubmit = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      alert("Profile updated!");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input {...register("name")} isReadOnly={!isEditMode} />
        </FormControl>

        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input {...register("email")} type="email" isReadOnly />
        </FormControl>
        
        {/* 其他字段：Email、Phone、Address 等 */}
        {isEditMode && <Button type="submit">Save</Button>}
      </Stack>
    </form>
  );
}