import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import CodeBlock from '@/components/app/CodeBlock';
import { COMPONENTS } from '@/data/components';
import ComponentPlayground from '@/components/app/ComponentPlayground';

async function readFilePath(filePath: string) {
  const readFile = promisify(fs.readFile);
  const fileContent = await readFile(
    path.join(process.cwd(), filePath),
    'utf8',
  );

  return fileContent;
}

export async function generateStaticParams() {
  const componentSlugs = COMPONENTS.map((component) => ({
    slug: component.slug,
  }));

  return componentSlugs;
}

export const dynamicParams = false;

// https://stackoverflow.com/questions/79124951/type-error-in-next-js-route-type-params-id-string-does-not-satis

const ComponentPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const param = await params;
  const currentComponentData = COMPONENTS.find(
    (component) => component.slug === param.slug,
  );

  if (!currentComponentData) {
    return <div>Component not found</div>;
  }

  const filePath = `./components/lab/${
    currentComponentData?.type
  }/${currentComponentData?.name.replace(/\s+/g, '')}.tsx`;

  const code = await readFilePath(filePath);
  const css = JSON.stringify(currentComponentData?.css, null, 2);
  return (
    <div className='mt-10 pb-32'>
      <h1 className='text-md mb-2 font-light text-neutral-400'>
        {currentComponentData.name}
      </h1>
      <div className='w-full'>
        <ComponentPlayground isCentered>
          <currentComponentData.component />
        </ComponentPlayground>
        <div className='mt-8'>
          <CodeBlock code={code} lang='tsx' />
        </div>
        {css ? (
          <div className='mt-8'>
            <CodeBlock
              code={JSON.parse(css)}
              lang='css'
              title='globals.css'
            />
          </div>
        ) : ""}
      </div>
    </div>
  );
};

export default ComponentPage;
