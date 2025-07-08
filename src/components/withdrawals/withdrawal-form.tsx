"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/format'

// 提现表单验证模式
const withdrawalFormSchema = z.object({
  amount: z.string()
    .refine(val => !isNaN(Number(val)), { message: "金额必须是数字" })
    .refine(val => Number(val) >= 100, { message: "最小提现金额为100元" }),
  paymentMethod: z.string({
    required_error: "请选择提现方式",
  }),
  accountName: z.string().min(2, { message: "账户名称至少需要2个字符" }),
  accountNumber: z.string().min(5, { message: "请输入有效的账号" }),
})

type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>

interface WithdrawalFormProps {
  availableBalance: number
}

export function WithdrawalForm({ availableBalance }: WithdrawalFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 默认表单值
  const defaultValues: Partial<WithdrawalFormValues> = {
    amount: "",
    paymentMethod: "",
    accountName: "",
    accountNumber: "",
  }

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues,
  })

  async function onSubmit(data: WithdrawalFormValues) {
    if (Number(data.amount) > availableBalance) {
      form.setError("amount", { 
        message: "提现金额不能超过可用余额" 
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // 这里应该是实际的API调用
      // const response = await fetch('/api/commissions/withdraw', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // })
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success("提现申请已提交")
      router.push('/dashboard/withdrawals')
      router.refresh()
    } catch (error) {
      toast.error("提交失败，请稍后重试")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="text-lg md:text-xl">申请提现</CardTitle>
        <CardDescription className="text-sm">
          填写以下信息申请提现，审核通常需要1-3个工作日
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
            <div className="bg-muted p-3 md:p-4 rounded-lg mb-4 md:mb-6">
              <div className="text-sm text-muted-foreground mb-1">可提现金额</div>
              <div className="text-xl md:text-2xl font-bold">{formatPrice(availableBalance)}</div>
            </div>
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">提现金额</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">¥</span>
                      <Input
                        placeholder="输入提现金额"
                        className="pl-8 h-12 touch-manipulation"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs md:text-sm">
                    最低提现金额为¥100
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">提现方式</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 touch-manipulation">
                        <SelectValue placeholder="选择提现方式" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="alipay">支付宝</SelectItem>
                      <SelectItem value="wechat">微信支付</SelectItem>
                      <SelectItem value="bank">银行卡</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">账户名称</FormLabel>
                  <FormControl>
                    <Input placeholder="输入账户名称" className="h-12 touch-manipulation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">账号</FormLabel>
                  <FormControl>
                    <Input placeholder="输入账号" className="h-12 touch-manipulation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-3 md:pt-4">
              <Button type="submit" className="w-full h-12 md:h-14 touch-manipulation" disabled={isSubmitting}>
                {isSubmitting ? "提交中..." : "提交提现申请"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs md:text-sm text-muted-foreground border-t pt-3 md:pt-4">
        <div>提现手续费：0%</div>
        <div>预计到账时间：1-3个工作日</div>
      </CardFooter>
    </Card>
  )
}