import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";
import AppLogo from "../layout/AppLogo";

const ComparisonSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h2 className="text-3xl md:text-4xl font-bold inline-flex items-center"> {/* Changed items-baseline to items-center */}
              <span className="mr-2 inline-block" style={{ transform: 'scale(0.45) translateY(0.1em)'}}>
                <AppLogo />
              </span>
               vs. The Rest
            </h2>
          </div>
          <p className="text-lg text-muted-foreground mt-2">
            See how Lexy stacks up against traditional transcription methods and other services.
          </p>
        </div>
        <div className="max-w-3xl mx-auto bg-card p-6 rounded-lg shadow-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Feature</TableHead>
                <TableHead className="text-center text-primary font-semibold">Lexy</TableHead>
                <TableHead className="text-center">Others</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Speed (Turnaround)</TableCell>
                <TableCell className="text-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                  <span className="block text-xs">Minutes</span>
                </TableCell>
                <TableCell className="text-center">
                  <XCircle className="h-6 w-6 text-red-500 mx-auto" />
                  <span className="block text-xs">Hours/Days</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cost-Effectiveness</TableCell>
                <TableCell className="text-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <XCircle className="h-6 w-6 text-red-500 mx-auto" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">NDA &amp; Bureau of Prisons (BOP) Compliance Focus</TableCell>
                <TableCell className="text-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-muted-foreground">Varies</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Advanced AI Features</TableCell>
                <TableCell className="text-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-muted-foreground">Limited</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Integration Options</TableCell>
                <TableCell className="text-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-muted-foreground">Basic/None</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
