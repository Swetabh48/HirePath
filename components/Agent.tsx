// This is now just a wrapper for backward compatibility
import EnhancedAgent from './EnhancedAgent';

const Agent = (props: any) => {
  return <EnhancedAgent {...props} />;
};

export default Agent;