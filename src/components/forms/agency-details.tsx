"use client";

import React, { useEffect, useState } from "react";
import * as z from "zod";
import { Agency } from "@prisma/client";
import { useRouter } from "next/navigation";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { NumberInput } from "@tremor/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FileUpload from "@/components/global/file-upload";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type Props = {
  agencyProps?: Partial<Agency>;
};

const FormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Agency name must be at least 2 characters long" }),
  companyEmail: z.string().email(),
  companyPhone: z.string().min(10),
  whiteLabel: z.boolean(),
  address: z.string().min(10),
  city: z.string().min(2),
  zipCode: z.string().min(5),
  state: z.string().min(2),
  country: z.string().min(2),
  agencyLogo: z.string().url("Invalid URL"),
  goal: z
    .string()
    .regex(/^\d+$/)
    .min(1, "Goal must be set between 1-9")
    .max(2, "Goal must be set between 1-9")
    .transform(Number),
});

function AgencyDetails({ agencyProps }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [deleteAgency, setDeleteAgency] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: agencyProps?.name || "",
      companyEmail: agencyProps?.companyEmail || "",
      companyPhone: agencyProps?.companyPhone || "",
      whiteLabel: agencyProps?.whiteLabel || false,
      address: agencyProps?.address || "",
      city: agencyProps?.city || "",
      zipCode: agencyProps?.zipCode || "",
      state: agencyProps?.state || "",
      country: agencyProps?.country || "",
      agencyLogo: agencyProps?.agencyLogo || "",
      goal: agencyProps?.goal || 1,
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (agencyProps) {
      // react-hook-form caches the agencyProps, so we need to reset the form with the new agencyProps
      form.reset(agencyProps);
    }
  }, [agencyProps]);

  const handleSubmit = async () => {};

  console.log(form.formState.errors);

  return (
    <AlertDialog>
      <Card className="w=full ">
        <CardHeader>
          <CardTitle>Agency Information</CardTitle>
          <CardDescription>
            Lets create an agency for your business. You can edit agency
            settings later from the agency settings tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                disabled={isLoading}
                control={form.control}
                name="agencyLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Logo</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="agencyLogo"
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Name</FormLabel>
                      <FormControl>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Your Agency Name"
                          />
                        </FormControl>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Email</FormLabel>
                      <FormControl>
                        <Input readOnly placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                disabled={isLoading}
                control={form.control}
                name="whiteLabel"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                      <div>
                        <FormLabel>Whitelabel Agency</FormLabel>
                        <FormDescription>
                          Turning on whilelabel mode will show your agency logo
                          to all sub accounts by default. You can overwrite this
                          functionality through sub account settings.
                        </FormDescription>
                      </div>

                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 st..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Zipcpde</FormLabel>
                      <FormControl>
                        <Input placeholder="Zipcode" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                disabled={isLoading}
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* if agency id exists, give option to add goal */}
              {/* {agencyProps?.id && ( */}
              <div className="flex flex-col gap-2">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Create A Goal</FormLabel>
                      <FormDescription>
                        ✨ Create a goal for your agency. As your business grows
                        your goals grow too so dont forget to set the bar
                        higher!
                      </FormDescription>
                      <FormControl>
                        <NumberInput
                          {...field}
                          error={Boolean(form.formState.errors.goal?.message)}
                          errorMessage={form.formState.errors.goal?.message}
                          defaultValue={agencyProps?.goal}
                          onValueChange={async (val) => {
                            form.setValue("goal", val);
                            if (!agencyProps?.id) return;
                          }}
                          min={1}
                          max={10}
                          className="bg-background !border !border-input"
                          placeholder="Sub Account Goal"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              {/* )} */}
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
}

export default AgencyDetails;
