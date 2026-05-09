"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Profile } from "@/lib/types";

type Actions = {
  updateProfileAction: () => Promise<void>;
};

export default function ProfileClient({
  initialData,
  actions,
}: {
  initialData: {
    profile: Profile;
  };
  actions: Actions;
}) {
  const { profile } = initialData;
  return (
    <div className="">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" defaultValue={profile.user.name} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={profile.user.email}
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>Your email verification status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {profile.user.emailVerified ? (
                  <Badge variant="secondary">Verified</Badge>
                ) : (
                  <Badge variant="outline">Unverified</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={profile.user.image} />
                  <AvatarFallback className="text-lg">
                    {profile.user.name[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.user.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
