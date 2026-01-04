"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteJob } from "@/server/actions/jobs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface JobsListActionsProps {
  jobId: number;
}

export function JobsListActions({ jobId }: JobsListActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteJob(jobId);
      if (result.success) {
        toast.success("职位删除成功");
        router.refresh();
      } else {
        toast.error(result.error || "删除失败，请稍后重试");
      }
    } catch (error: any) {
      toast.error(error.message || "删除失败，请稍后重试");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" asChild>
        <Link href={`/dashboard/jobs/${jobId}`}>
          <Pencil className="mr-2 h-4 w-4" />
          编辑
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isDeleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这个职位吗？此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

