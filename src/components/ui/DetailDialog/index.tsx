import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export interface DetailItem {
  label: string;
  value: React.ReactNode;
}

export interface DetailDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  details: DetailItem[];
  /**
   * Optionally override the default width/size class for the DialogContent.
   */
  dialogContentClassName?: string;
  /**
   * Optionally pass a custom footer.
   */
  dialogFooter?: React.ReactNode;
}

export const DetailDialog: React.FC<DetailDialogProps> = ({
  open,
  onClose,
  title,
  description,
  details,
  dialogContentClassName = 'w-full max-w-lg',
  dialogFooter,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={dialogContentClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="rounded-md border mt-2 max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Параметр</TableHead>
                <TableHead>Значение</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.map((detail, index) => (
                <TableRow key={index}>
                  <TableCell className="font-bold">{detail.label}</TableCell>
                  <TableCell>{detail.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          {dialogFooter ? dialogFooter : <Button onClick={onClose}>Закрыть</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DetailDialog;