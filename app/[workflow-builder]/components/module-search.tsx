import { SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ModuleSearch = () => (
  <div className="flex flex-col p-4 text-gray-600">
    <InputGroup>
      <InputGroupInput
        className="placeholder:text-gray-600 text-gray-600"
        placeholder="搜尋模組..."
      />
      <InputGroupAddon className="text-gray-600">
        <SearchIcon className="text-gray-600" />
      </InputGroupAddon>
    </InputGroup>
  </div>
);

export default ModuleSearch;
