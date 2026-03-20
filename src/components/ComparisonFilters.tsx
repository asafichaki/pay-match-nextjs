import { Building2, Globe, Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ComparisonFiltersProps {
  businessType: string;
  market: string;
  sortBy: string;
  onBusinessTypeChange: (value: string) => void;
  onMarketChange: (value: string) => void;
  onSortByChange: (value: string) => void;
}

const ComparisonFilters = ({
  businessType,
  market,
  sortBy,
  onBusinessTypeChange,
  onMarketChange,
  onSortByChange,
}: ComparisonFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
      <Select value={businessType} onValueChange={onBusinessTypeChange}>
        <SelectTrigger className="bg-card border border-border/50 shadow-md hover:shadow-lg transition-shadow h-12">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-foreground/60" />
            <SelectValue placeholder="Business Type" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-card border border-border/50 shadow-lg">
          <SelectItem value="all">All Business Types</SelectItem>
          <SelectItem value="retail">Retail</SelectItem>
          <SelectItem value="ecommerce">E-commerce</SelectItem>
          <SelectItem value="restaurant">Restaurant</SelectItem>
          <SelectItem value="services">Services</SelectItem>
        </SelectContent>
      </Select>

      <Select value={market} onValueChange={onMarketChange}>
        <SelectTrigger className="bg-card border border-border/50 shadow-md hover:shadow-lg transition-shadow h-12">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-foreground/60" />
            <SelectValue placeholder="Market" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-card border border-border/50 shadow-lg">
          <SelectItem value="all">All Markets</SelectItem>
          <SelectItem value="us">United States</SelectItem>
          <SelectItem value="global">Global</SelectItem>
          <SelectItem value="eu">Europe</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="bg-card border border-border/50 shadow-md hover:shadow-lg transition-shadow h-12">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-foreground/60" />
            <SelectValue placeholder="Sort By" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-card border border-border/50 shadow-lg">
          <SelectItem value="best">Overall Best</SelectItem>
          <SelectItem value="rating">Highest Rating</SelectItem>
          <SelectItem value="fees">Lowest Fees</SelectItem>
          <SelectItem value="speed">Fastest Funding</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ComparisonFilters;
