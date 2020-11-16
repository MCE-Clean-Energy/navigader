import * as React from 'react';
import Box from '@material-ui/core/Box';
import MuiAppBar from '@material-ui/core/AppBar';
import MuiTab from '@material-ui/core/Tab';
import MuiTabs from '@material-ui/core/Tabs';

import { Card } from './Card';

/** ============================ Types ===================================== */
type ChangeEvent = React.ChangeEvent<{}>;
type TabsProps = {
  children: React.ReactElement<TabProps>[];
  initialTab?: string;
  onChange?: (value: string, event: ChangeEvent) => void;
};

type TabProps = React.PropsWithChildren<{
  title: string;
}>;

type TabsContextType = {
  activeTab: string;
};

/** ============================ Context =================================== */
const TabsContext = React.createContext<TabsContextType>({
  activeTab: '',
});

/** ============================ Components ================================ */
const Tab: React.FC<TabProps> = ({ children, title }) => {
  const { activeTab } = React.useContext(TabsContext);
  if (activeTab !== title) return <Box display="none">{children}</Box>;
  return <Box p={2}>{children}</Box>;
};

export const Tabs = Object.assign(
  React.forwardRef<HTMLButtonElement, TabsProps>(({ children, initialTab, onChange }, ref) => {
    // Iterate over the children and grab the titles
    const titles = React.Children.map(children, (child) => child.props.title);

    // Component state
    const [activeTab, setActiveTab] = React.useState(initialTab || titles[0]);

    return (
      <Card padding={0} raised>
        <MuiAppBar color="default" position="static" elevation={0}>
          <MuiTabs
            centered
            indicatorColor="primary"
            onChange={handleChange}
            ref={ref}
            textColor="primary"
            value={activeTab}
          >
            {titles.map((title, i) => (
              <MuiTab key={i} label={title} value={title} />
            ))}
          </MuiTabs>
        </MuiAppBar>

        <TabsContext.Provider value={{ activeTab }}>{children}</TabsContext.Provider>
      </Card>
    );

    /** ========================== Callbacks ================================= */
    function handleChange(event: React.ChangeEvent<{}>, newValue: string) {
      setActiveTab(newValue);
      if (onChange) onChange(newValue, event);
    }
  }),
  {
    Tab,
  }
);
