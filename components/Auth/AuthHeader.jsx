import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";

export default function AuthHeader({ title, description }) {
  return (
    <div className="pt-10 pb-10 text-center">
      <div className="">
        <Heading as="h1" className="mb-3 text-2xl leading-snug">
          {title}
        </Heading>

        {description && (
          <Text className="mx-auto leading-snug max-w-[52.5rem] text-base font-medium">
            {description}
          </Text>
        )}
      </div>
    </div>
  );
}
