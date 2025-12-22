import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { settingsService } from '@/lib/settingsService';
import { FamilyMember, COUNTRY_CODES } from '@/types/settings';
import { toast } from 'sonner';
import { Plus, X, ChevronDown, Search } from 'lucide-react';

export function ParentalControlsSettings() {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [inputMethod, setInputMethod] = useState<'phone' | 'email'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
  const [role, setRole] = useState<'parent' | 'child'>('parent');
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  useEffect(() => {
    if (user) {
      loadFamilyMembers();
    }
  }, [user]);

  const loadFamilyMembers = async () => {
    if (!user) return;
    const members = await settingsService.getFamilyMembers(user.id);
    setFamilyMembers(members);
  };

  const handleAddMember = async () => {
    if (!user) return;
    
    if (inputMethod === 'email' && !email) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (inputMethod === 'phone' && !phone) {
      toast.error('Please enter a phone number');
      return;
    }

    const member = await settingsService.addFamilyMember(user.id, {
      email: inputMethod === 'email' ? email : undefined,
      phone: inputMethod === 'phone' ? `${selectedCountryCode}${phone}` : undefined,
      role,
    });

    if (member) {
      setFamilyMembers([...familyMembers, member]);
      toast.success('Family member invited');
      setShowAddModal(false);
      setEmail('');
      setPhone('');
    } else {
      toast.error('Failed to add family member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const success = await settingsService.removeFamilyMember(memberId);
    if (success) {
      setFamilyMembers(familyMembers.filter(m => m.id !== memberId));
      toast.success('Family member removed');
    } else {
      toast.error('Failed to remove member');
    }
  };

  const filteredCountryCodes = COUNTRY_CODES.filter(c =>
    c.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-2">Parental controls</h3>
      
      <p className="text-muted-foreground">
        Parents and teens can link accounts, giving parents tools to adjust certain features, set limits, and add safeguards that work for their family.
      </p>

      <button
        onClick={() => setShowAddModal(true)}
        className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-border rounded-2xl hover:bg-accent transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>Add family member</span>
      </button>

      {/* Family Members List */}
      {familyMembers.length > 0 && (
        <div className="space-y-2 mt-6">
          <h4 className="font-medium">Family members</h4>
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg"
            >
              <div>
                <div className="font-medium">{member.email || member.phone}</div>
                <div className="text-sm text-muted-foreground capitalize">{member.role}</div>
                <div className="text-xs text-muted-foreground">Status: {member.status}</div>
              </div>
              <button
                onClick={() => handleRemoveMember(member.id)}
                className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Family Member Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl z-[61] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Invite family member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Input Method Toggle */}
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">
                  {inputMethod === 'email' ? 'Email address' : 'Phone number'}
                </label>
                <button
                  onClick={() => setInputMethod(inputMethod === 'email' ? 'phone' : 'email')}
                  className="text-sm text-primary hover:underline"
                >
                  Use {inputMethod === 'email' ? 'phone' : 'email'}
                </button>
              </div>

              {/* Email Input */}
              {inputMethod === 'email' && (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full px-3 py-2 bg-accent rounded-lg border border-border outline-none"
                />
              )}

              {/* Phone Input */}
              {inputMethod === 'phone' && (
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowCountrySelector(!showCountrySelector)}
                      className="px-3 py-2 bg-accent rounded-lg border border-border hover:bg-accent/80 transition-colors flex items-center gap-1"
                    >
                      <span>{selectedCountryCode}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {showCountrySelector && (
                      <>
                        <div
                          className="fixed inset-0 z-[70]"
                          onClick={() => setShowCountrySelector(false)}
                        />
                        <div className="absolute top-full left-0 mt-1 w-80 max-h-96 bg-popover border border-border rounded-lg shadow-2xl z-[71] overflow-hidden">
                          <div className="p-2 border-b border-border">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <input
                                type="text"
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                placeholder="Search countries..."
                                className="w-full pl-8 pr-3 py-1.5 bg-background rounded border border-border outline-none text-sm"
                              />
                            </div>
                          </div>
                          <div className="overflow-y-auto max-h-80">
                            {filteredCountryCodes.map((country, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSelectedCountryCode(country.code);
                                  setShowCountrySelector(false);
                                  setCountrySearch('');
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-left"
                              >
                                <span className="text-2xl">{country.flag}</span>
                                <span className="flex-1 text-sm">{country.country}</span>
                                <span className="text-sm text-muted-foreground">{country.code}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Phone number"
                    className="flex-1 px-3 py-2 bg-accent rounded-lg border border-border outline-none"
                  />
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                If your family member is new to Haitian ChatGPT, they'll be asked to create an account.
              </p>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">This person is:</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="parent"
                      checked={role === 'parent'}
                      onChange={(e) => setRole(e.target.value as 'parent')}
                      className="w-4 h-4"
                    />
                    <span>My parent or guardian</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="child"
                      checked={role === 'child'}
                      onChange={(e) => setRole(e.target.value as 'child')}
                      className="w-4 h-4"
                    />
                    <span>My child</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={inputMethod === 'email' ? !email : !phone}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
