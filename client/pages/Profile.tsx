import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Profile() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return (
    <div className="container mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {token ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">You are logged in.</p>
              <p className="text-sm">Token present in local storage.</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">You are not logged in.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


