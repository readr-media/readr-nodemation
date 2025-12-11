import { SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ModuleSearch = () => (
  <div className="border-y border-module-border px-4 py-3">
    <InputGroup className="h-[37px] min-h-[37px] gap-3 rounded-lg border-module-border bg-white px-3 shadow-none">
      <InputGroupAddon className="text-[13px] text-module-placeholder">
        <SearchIcon className="size-4 stroke-[1.5] text-module-placeholder" />
      </InputGroupAddon>
      <InputGroupInput
        className="text-sm leading-[21px] text-module-text placeholder:text-module-placeholder"
        placeholder="搜尋模組..."
      />
    </InputGroup>
  </div>
);

export default ModuleSearch;
